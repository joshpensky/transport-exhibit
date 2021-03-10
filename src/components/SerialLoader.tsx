import { Fragment, PropsWithChildren, useRef } from "react";
import tw from "twin.macro";
import { useSerial } from "@src/providers/SerialProvider";

interface SerialLoaderProps {}

const SerialLoader = ({ children }: PropsWithChildren<SerialLoaderProps>) => {
  const { canUseSerial, portState, hasTriedAutoconnect, connect } = useSerial();

  const pairButtonRef = useRef<HTMLButtonElement>(null);

  const onPairButtonClick = async () => {
    const hasConnected = await connect();
    if (!hasConnected) {
      pairButtonRef.current?.focus();
    }
  };

  // If can't use serial, return error message
  if (!canUseSerial) {
    return (
      <div
        css={[
          tw`flex flex-col flex-1 min-h-screen items-center justify-center`,
        ]}
      >
        <div css={tw`flex flex-col w-full max-w-lg p-6 bg-white rounded-xl`}>
          <h1 css={[tw`text-xl font-bold mb-2`]}>Error</h1>
          <p css={[tw`mb-0.5`]}>
            Your browser doesn't support the{" "}
            <a
              css={[tw`text-blue-700 hocus:underline`]}
              href="https://web.dev/serial/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Web Serial API
            </a>
            !
          </p>
          <p>Please try updating or switching to a supported browser.</p>
        </div>
      </div>
    );
  }

  // If port is open, show the children!
  if (portState === "open") {
    return <Fragment>{children}</Fragment>;
  }

  // If autoconnect hasn't run its course yet, wait for that...
  if (!hasTriedAutoconnect) {
    return null;
  }

  // If autoconnect fails, then show manual connect button

  let buttonText = "";
  if (portState === "closed") {
    buttonText = "Pair device";
  } else if (portState === "opening") {
    buttonText = "Pairing...";
  } else if (portState === "closing") {
    buttonText = "Disconnecting...";
  }

  return (
    <div
      css={[tw`flex flex-col flex-1 min-h-screen items-center justify-center`]}
    >
      <div css={tw`flex flex-col w-full max-w-lg p-6 bg-white rounded-xl`}>
        <h1 css={[tw`text-xl font-bold mb-2`]}>Connect to RedBoard</h1>

        <p css={[tw`mb-5`]}>
          Pair your SparkFun Electronics RedBoard via USB to get started.
        </p>

        <button
          css={[
            tw`text-white font-medium bg-indigo-600 px-2 py-2.5 rounded-md`,
            tw`transition-all ring-indigo-600 ring-0 ring-opacity-50 hocus:bg-indigo-700 focus:(outline-none ring)`,
            tw`disabled:(text-gray-500 bg-gray-200 cursor-not-allowed)`,
          ]}
          ref={pairButtonRef}
          disabled={portState === "opening" || portState === "closing"}
          onClick={onPairButtonClick}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SerialLoader;
