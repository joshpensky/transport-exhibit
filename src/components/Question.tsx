import { useEffect } from "react";
import tw from "twin.macro";
import { SerialMessage, useSerial } from "@src/providers/SerialProvider";

const Question = () => {
  const { subscribe } = useSerial();

  const onMessage = (message: SerialMessage) => {
    console.log(`${message.timestamp}: ${message.value}`);
  };

  useEffect(() => {
    const unsubscribe = subscribe(onMessage);
    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  return <div css={[tw`text-lg`]}>Welcome to the questions!</div>;
};

export default Question;
