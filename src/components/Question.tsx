import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import tw from "twin.macro";
import { SerialMessage, useSerial } from "@src/providers/SerialProvider";
import anime from "animejs";

const ANSWER_TIME_SEC = 30;

interface AnswerProps {
  selected?: boolean;
}
const Answer = ({ children, selected }: PropsWithChildren<AnswerProps>) => (
  <div
    css={[
      tw`w-full text-center text-xl bg-white p-8 rounded-xl mx-4 first:ml-0 last:mr-0`,
      selected && tw`bg-gray-300`,
    ]}
  >
    <p>{children}</p>
  </div>
);

const useButtonPress = (value: string) => {
  const { subscribe } = useSerial();

  const [isPressed, setIsPressed] = useState(false);

  const onMessage = useCallback(
    (message: SerialMessage) => {
      if (message.value === value) {
        setIsPressed(true);
      }
    },
    [value]
  );

  // Simulate a button press-and-release state (about 150ms)
  useEffect(() => {
    if (isPressed) {
      setTimeout(() => {
        setIsPressed(false);
      }, 150);
    }
  }, [isPressed]);

  // Wait for the button press message
  useEffect(() => {
    if (!isPressed) {
      const unsubscribe = subscribe(onMessage);
      return () => {
        unsubscribe();
      };
    }
  }, [subscribe, onMessage, isPressed]);

  return isPressed;
};

const Question = () => {
  const { subscribe } = useSerial();

  const progressBarRef = useRef<HTMLDivElement>(null);

  // TODO: add other buttons and check interaction when pressing 1 or more at the same time
  const isCarPressed = useButtonPress("A");

  useEffect(() => {
    if (!isCarPressed) {
      anime({
        targets: progressBarRef.current,
        scaleX: [0, 1],
        easing: "linear",
        duration: ANSWER_TIME_SEC * 1000,
      });
    }
  }, [isCarPressed]);

  // Log serial messages
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      console.log(`${message.timestamp}: ${message.value}`);
    });
    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  return (
    <div css={[tw`flex flex-1 min-h-screen`]}>
      <div css={[tw`flex flex-col flex-1 m-8 bg-white rounded-2xl`]}>
        <div css={tw`m-16 flex flex-col flex-1 bg-indigo-900`}>
          <div css={tw`h-4 w-full bg-yellow-400 bg-opacity-50`}>
            <div
              ref={progressBarRef}
              css={tw`h-full w-full bg-yellow-400 origin-left`}
            />
          </div>

          <div css={tw`flex flex-1 items-end m-8`}>
            <Answer selected={isCarPressed}>Car</Answer>
            <Answer>MBTA</Answer>
            <Answer>Bike</Answer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;
