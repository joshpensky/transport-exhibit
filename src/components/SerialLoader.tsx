import { Fragment, PropsWithChildren } from "react";
import tw from "twin.macro";
import { useSerial } from "@src/providers/SerialProvider";

interface SerialLoaderProps {}

const SerialLoader = ({ children }: PropsWithChildren<SerialLoaderProps>) => {
  const { canUseSerial, portState, connect } = useSerial();

  if (!canUseSerial) {
    return <p>Can't use serial in this browser</p>;
  }

  if (portState === "open") {
    return <Fragment>{children}</Fragment>;
  }

  let buttonText = "";
  if (portState === "closed") {
    buttonText = "Pair";
  } else if (portState === "opening") {
    buttonText = "Pairing";
  } else if (portState === "closing") {
    buttonText = "Disconnecting";
  }

  return (
    <div
      css={[tw`flex flex-col flex-1 min-h-screen items-center justify-center`]}
    >
      <h1 css={[tw`text-xl font-bold m-4`]}>Connect to RedBoard</h1>
      <button
        disabled={portState === "opening" || portState === "closing"}
        onClick={connect}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default SerialLoader;
