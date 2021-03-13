import { useCallback, useEffect, useRef, useState } from "react";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import DirectionsCarIcon from "@material-ui/icons/DirectionsCar";
import DirectionsSubwayIcon from "@material-ui/icons/DirectionsSubway";
import anime from "animejs";
import tw from "twin.macro";
import { Answer } from "@src/components/Answer";
import { Question } from "@src/components/Question";
import { useSerial } from "@src/providers/SerialProvider";

interface PageProps {
  onComplete(): void;
  question: string;
}

type TransitionState = "entering" | "entered" | "exiting" | "exited";

const Page = ({ onComplete, question }: PageProps) => {
  const { subscribe } = useSerial();

  const pageRef = useRef<HTMLDivElement>(null);
  const [transitionState, setTransitionState] = useState<TransitionState>(
    "entering"
  );

  const [response, setResponse] = useState<string | null>(null);

  const respond = useCallback((newResponse: string) => {
    setResponse((response) => {
      if (response === null) {
        return newResponse;
      }
      return response;
    });
  }, []);

  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (response) {
      setIsTimerRunning(false);
      setTransitionState("exiting");
    }
  }, [response]);

  // Log serial messages
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      console.log(`${message.timestamp}: ${JSON.stringify(message.value)}`);
    });
    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  useEffect(() => {
    const page = pageRef.current;
    if (transitionState === "entering") {
      anime({
        targets: page,
        opacity: [0, 1],
        duration: 300,
        easing: "linear",
        delay: 500,
        endDelay: 500,
        complete() {
          setTransitionState("entered");
        },
      });
    } else if (transitionState === "entered") {
      anime.set(page, { opacity: 1 });
      setIsTimerRunning(true);
    } else if (transitionState === "exiting") {
      anime({
        targets: page,
        opacity: [1, 0],
        duration: 300,
        easing: "linear",
        delay: 1000,
        complete() {
          setTransitionState("exited");
        },
      });
    } else if (transitionState === "exited") {
      anime.set(page, { opacity: 0 });
      onComplete();
    }
  }, [transitionState, onComplete]);

  return (
    <div
      ref={pageRef}
      css={[
        tw`flex flex-col items-center pt-10 px-6 flex-1 opacity-0 min-h-screen`,
      ]}
    >
      <Question
        question={question}
        isTimerRunning={isTimerRunning}
        onTimeUp={() => {
          // TODO: change to show recommended answer
          setResponse("B");
        }}
      />

      <div css={[tw`absolute inset-0 flex flex-1 w-full px-28 pt-36`]}>
        <div
          css={[
            tw`flex flex-1 bg-gray-400 rounded-t-3xl relative overflow-hidden`,
          ]}
        >
          <img
            css={[
              tw`absolute inset-0 w-full h-full object-cover object-center`,
            ]}
            src={process.env.PUBLIC_URL + "/img/map.png"}
            alt=""
          />
        </div>
      </div>

      <div
        css={[tw`absolute inset-0 flex items-end justify-center w-full px-16`]}
      >
        <Answer
          value="B"
          icon={DirectionsBikeIcon}
          disabled={!!response || !isTimerRunning}
          selected={response === "B"}
          onPress={() => respond("B")}
        >
          Bike
        </Answer>
        <Answer
          value="T"
          icon={DirectionsSubwayIcon}
          disabled={!!response || !isTimerRunning}
          selected={response === "T"}
          onPress={() => respond("T")}
        >
          Subway
        </Answer>
        <Answer
          value="C"
          icon={DirectionsCarIcon}
          disabled={!!response || !isTimerRunning}
          selected={response === "C"}
          onPress={() => respond("C")}
        >
          Car
        </Answer>
      </div>
    </div>
  );
};

export default Page;
