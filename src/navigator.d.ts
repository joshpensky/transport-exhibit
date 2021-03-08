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
