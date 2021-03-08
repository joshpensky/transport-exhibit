import { useContext, useEffect, useState } from "react";
import { SerialContext, SerialMessage } from "./SerialProvider";
import "./App.css";

const App = () => {
  const {
    canUseSerial,
    subscribe,
    portState,
    connect,
    disconnect,
  } = useContext(SerialContext);

  const [log, setLog] = useState<SerialMessage[]>([]);

  useEffect(() => {
    if (canUseSerial && portState === "open") {
      const onMessage = (message: SerialMessage) => {
        setLog((log) => [message, ...log]);
      };

      const unsub = subscribe(onMessage);
      return unsub;
    }
  }, [canUseSerial, portState, subscribe]);

  if (!canUseSerial) {
    return <p>Can't use serial in this browser</p>;
  }

  let buttonText = "";
  if (portState === "closed") {
    buttonText = "Connect";
  } else if (portState === "opening") {
    buttonText = "Connecting";
  } else if (portState === "open") {
    buttonText = "Disconnect";
  } else if (portState === "closing") {
    buttonText = "Disconnecting";
  }

  let buttonAction = disconnect;
  if (portState === "closed") {
    buttonAction = connect;
  }

  return (
    <div>
      <button
        disabled={portState === "opening" || portState === "closing"}
        onClick={buttonAction}
      >
        {buttonText}
      </button>

      <pre>
        <code>{JSON.stringify(log, null, 2)}</code>
      </pre>
    </div>
  );
};

export default App;
