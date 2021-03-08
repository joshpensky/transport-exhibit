import { useEffect, useRef, useState } from "react";
import "./App.css";

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

type PortState = "closed" | "closing" | "open";

type Message = {
  value: string;
  timestamp: number;
};

// RESOURCES:
// https://web.dev/serial/
// https://reillyeon.github.io/serial/#onconnect-attribute-0
// https://codelabs.developers.google.com/codelabs/web-serial

const App = () => {
  const [canUseSerial] = useState(() => "serial" in navigator);

  const [log, setLog] = useState<Message[]>([]);

  const [portState, setPortState] = useState<PortState>("closed");
  const portStateRef = useRef<PortState>("closed");
  const updatePortState = (nextState: PortState) => {
    portStateRef.current = nextState;
    setPortState(nextState);
  };

  const [hasManuallyDisconnected, setHasManuallyDisconnected] = useState(false);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const readerClosedPromiseRef = useRef<Promise<void>>(Promise.resolve());

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
          setLog((log) => [{ value: value + "/", timestamp }, ...log]);
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
      updatePortState("open");
      setHasManuallyDisconnected(false);
    } catch (error) {
      console.error("Could not open port", error);
    }
  };

  const manualConnectToPort = async () => {
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
      console.error("User did not select port", error);
    }
  };

  const autoconnectToPort = async () => {
    const availablePorts = await navigator.serial.getPorts();
    if (availablePorts.length) {
      const port = availablePorts[0];
      await openPort(port);
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
    updatePortState("closed");
  };

  const manualDisconnectFromPort = async () => {
    const port = portRef.current;
    if (port) {
      updatePortState("closing");

      // Cancel any reading from port
      readerRef.current?.cancel();
      await readerClosedPromiseRef.current;
      readerRef.current = null;

      // Close and nullify the port
      await port.close();
      portRef.current = null;

      // Update port state
      setHasManuallyDisconnected(true);
      updatePortState("closed");
    }
  };

  // Handles attaching the reader and disconnect listener when the port is open
  useEffect(() => {
    const port = portRef.current;
    if (portState === "open" && portState === portStateRef.current && port) {
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

  // Tries to autoconnect to a port if possible
  useEffect(() => {
    if (!hasManuallyDisconnected && canUseSerial && portState === "closed") {
      autoconnectToPort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseSerial, hasManuallyDisconnected, portState]);

  if (!canUseSerial) {
    return <p>Can't use serial in this browser</p>;
  }

  return (
    <div>
      <button
        disabled={portState === "closing"}
        onClick={
          portState === "closed"
            ? manualConnectToPort
            : manualDisconnectFromPort
        }
      >
        {portState === "closed"
          ? "Connect"
          : portState === "open"
          ? "Disconnect"
          : "Disconnecting"}
      </button>

      <pre>
        <code>{JSON.stringify(log, null, 2)}</code>
      </pre>
    </div>
  );
};

export default App;
