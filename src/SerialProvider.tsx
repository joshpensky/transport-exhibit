import {
  createContext,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

interface PortOpenOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: "none" | "even" | "odd";
  bufferSize?: number;
  flowControl?: "none" | "hardware";
}

interface SerialPort {
  open(options: PortOpenOptions): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream;
  writable: WritableStream;
}

interface Filter {
  usbVendorId: number;
  usbProductId: number;
}

interface RequestPortOptions {
  filters: Filter[];
}

type SerialEventType = "connect" | "disconnect";

interface SerialConnectionEvent extends Event {
  port: SerialPort;
}

declare global {
  interface Navigator {
    serial: {
      addEventListener(
        type: SerialEventType,
        callback: (event: SerialConnectionEvent) => void
      ): void;
      removeEventListener(
        type: SerialEventType,
        callback: (event: SerialConnectionEvent) => void
      ): void;
      requestPort(options: RequestPortOptions): Promise<SerialPort>;
      getPorts(): Promise<SerialPort[]>;
    };
  }
}

type PortState = "closed" | "closing" | "open" | "opening";

export type SerialMessage = {
  value: string;
  timestamp: number;
};

type SerialMessageCallback = (message: SerialMessage) => void;

// RESOURCES:
// https://web.dev/serial/
// https://reillyeon.github.io/serial/#onconnect-attribute-0
// https://codelabs.developers.google.com/codelabs/web-serial

export interface SerialContextValue {
  canUseSerial: boolean;
  portState: PortState;
  connect(): void;
  disconnect(): void;
  subscribe(callback: SerialMessageCallback): () => void;
}
export const SerialContext = createContext<SerialContextValue>({
  canUseSerial: false,
  connect: () => {},
  disconnect: () => {},
  portState: "closed",
  subscribe: () => () => {},
});

interface SerialProviderProps {}
const SerialProvider = ({
  children,
}: PropsWithChildren<SerialProviderProps>) => {
  const [canUseSerial] = useState(() => "serial" in navigator);

  const [portState, setPortState] = useState<PortState>("closed");
  const [hasTriedAutoconnect, setHasTriedAutoconnect] = useState(false);
  const [hasManuallyDisconnected, setHasManuallyDisconnected] = useState(false);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const readerClosedPromiseRef = useRef<Promise<void>>(Promise.resolve());

  const subscribersRef = useRef<Map<string, SerialMessageCallback>>(new Map());
  /**
   * Subscribes a callback function to the message event.
   *
   * @param callback the callback function to subscribe
   * @returns an unsubscribe function
   */
  const subscribe = (callback: SerialMessageCallback) => {
    subscribersRef.current.set(callback.name, callback);
    return () => {
      subscribersRef.current.delete(callback.name);
    };
  };

  /**
   * Reads from the given port until it's been closed.
   *
   * @param port the port to read from
   */
  const readUntilClosed = async (port: SerialPort) => {
    if (port.readable) {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      readerRef.current = textDecoder.readable.getReader();

      try {
        while (true) {
          const { value, done } = await readerRef.current.read();
          if (done) {
            break;
          }
          const timestamp = Date.now();
          Array.from(subscribersRef.current).forEach(([name, callback]) => {
            callback({ value, timestamp });
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        readerRef.current.releaseLock();
      }

      await readableStreamClosed.catch(() => {}); // Ignore the error
    }
  };

  /**
   * Attempts to open the given port.
   */
  const openPort = async (port: SerialPort) => {
    try {
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      setPortState("open");
      setHasManuallyDisconnected(false);
    } catch (error) {
      setPortState("closed");
      console.error("Could not open port", error);
    }
  };

  const manualConnectToPort = async () => {
    if (canUseSerial && portState === "closed") {
      setPortState("opening");
      const filters = [
        // Can identify the vendor and product IDs by plugging in the device and visiting: chrome://device-log/
        // the IDs will be labeled `vid` and `pid`, respectively
        {
          usbVendorId: 0x1a86,
          usbProductId: 0x7523,
        },
      ];
      try {
        const port = await navigator.serial.requestPort({ filters });
        await openPort(port);
      } catch (error) {
        setPortState("closed");
        console.error("User did not select port", error);
      }
    }
  };

  const autoConnectToPort = async () => {
    setPortState("opening");
    setHasTriedAutoconnect(true);
    const availablePorts = await navigator.serial.getPorts();
    if (availablePorts.length) {
      const port = availablePorts[0];
      await openPort(port);
    } else {
      setPortState("closed");
    }
  };

  const manualDisconnectFromPort = async () => {
    if (canUseSerial && portState === "closed") {
      const port = portRef.current;
      if (port) {
        setPortState("closing");

        // Cancel any reading from port
        readerRef.current?.cancel();
        await readerClosedPromiseRef.current;
        readerRef.current = null;

        // Close and nullify the port
        await port.close();
        portRef.current = null;

        // Update port state
        setHasManuallyDisconnected(true);
        setHasTriedAutoconnect(false);
        setPortState("closed");
      }
    }
  };

  /**
   * Event handler for when the port is disconnected unexpectedly.
   */
  const onPortDisconnect = async () => {
    // Wait for the reader to finish it's current loop
    await readerClosedPromiseRef.current;
    // Update state
    readerRef.current = null;
    readerClosedPromiseRef.current = Promise.resolve();
    portRef.current = null;
    setHasTriedAutoconnect(false);
    setPortState("closed");
  };

  // Handles attaching the reader and disconnect listener when the port is open
  useEffect(() => {
    const port = portRef.current;
    if (portState === "open" && port) {
      // When the port is open, read until closed
      const aborted = { current: false };
      readerRef.current?.cancel();
      readerClosedPromiseRef.current.then(() => {
        if (!aborted.current) {
          readerRef.current = null;
          readerClosedPromiseRef.current = readUntilClosed(port);
        }
      });

      // Attach a listener for when the device is disconnected
      navigator.serial.addEventListener("disconnect", onPortDisconnect);

      return () => {
        aborted.current = true;
        navigator.serial.removeEventListener("disconnect", onPortDisconnect);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portState]);

  // Tries to auto-connect to a port, if possible
  useEffect(() => {
    if (
      canUseSerial &&
      !hasManuallyDisconnected &&
      !hasTriedAutoconnect &&
      portState === "closed"
    ) {
      autoConnectToPort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseSerial, hasManuallyDisconnected, portState]);

  return (
    <SerialContext.Provider
      value={{
        canUseSerial,
        subscribe,
        portState,
        connect: manualConnectToPort,
        disconnect: manualDisconnectFromPort,
      }}
    >
      {children}
    </SerialContext.Provider>
  );
};

export default SerialProvider;
