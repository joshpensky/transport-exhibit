import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import DirectionsCarIcon from "@material-ui/icons/DirectionsCar";
import DirectionsSubwayIcon from "@material-ui/icons/DirectionsSubway";
import anime from "animejs";
import tw, { theme } from "twin.macro";
import { useSerial } from "@src/providers/SerialProvider";
import useButtonPress from "@src/hooks/useButtonPress";
import type { OverridableComponent } from "@material-ui/core/OverridableComponent";
import type { SvgIconTypeMap } from "@material-ui/core";

const ANSWER_TIME_SEC = 10;

interface AnswerProps {
  disabled?: boolean;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  onPress(): void;
  selected?: boolean;
  value: string;
}
const Answer = ({
  children,
  disabled,
  icon: Icon,
  onPress,
  selected,
  value,
}: PropsWithChildren<AnswerProps>) => {
  const isPressed = useButtonPress(value);

  useEffect(() => {
    if (!disabled && isPressed) {
      onPress();
    }
  }, [disabled, isPressed, onPress]);

  return (
    <div
      css={[
        tw`flex w-full items-center justify-center text-xl p-8 rounded-t-3xl`,
        tw`transition-colors bg-white text-green-900 ring ring-green-900`,
        tw`mx-6 first:ml-0 last:mr-0`,
        selected && tw`bg-lime-400`,
      ]}
    >
      <div css={[tw`w-14 h-14`]}>
        <Icon style={{ width: "100%", height: "100%" }} />
      </div>
      <p css={[tw`text-3xl ml-4`]}>{children}</p>
    </div>
  );
};

const Question = () => {
  const { subscribe } = useSerial();

  const progressBarRef = useRef<HTMLDivElement>(null);

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
    if (isTimerRunning) {
      const progressBar = progressBarRef.current;
      const PROGRESS_BAR_HEIGHT = theme`height.7`;

      const tl = anime.timeline();
      tl.add({
        targets: progressBar,
        height: [0, PROGRESS_BAR_HEIGHT],
        opacity: [0, 1],
        easing: "easeOutCirc",
        duration: 300,
      });
      tl.add({
        targets: progressBar,
        scaleX: [0, 1],
        easing: "linear",
        duration: ANSWER_TIME_SEC * 1000,
      });
      tl.finished.then(() => {
        // TODO: change to show recommended answer
        setResponse("B");
      });

      return () => {
        tl.pause();
        anime({
          targets: progressBar,
          height: [PROGRESS_BAR_HEIGHT, 0],
          opacity: [1, 0],
          easing: "easeOutCirc",
          duration: 300,
        });
      };
    }
  }, [isTimerRunning]);

  useEffect(() => {
    if (response) {
      setIsTimerRunning(false);
      const timeout = setTimeout(() => {
        setResponse(null);
      }, 1000);

      return () => {
        clearTimeout(timeout);
      };
    }

    const timeout = setTimeout(() => setIsTimerRunning(true), 1000);
    return () => {
      clearTimeout(timeout);
    };
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

  return (
    <div css={[tw`flex flex-col items-center pt-10 px-6 flex-1 min-h-screen`]}>
      <div>
        <div
          css={[
            tw`flex flex-col w-full max-w-6xl rounded-3xl bg-white ring ring-green-900 z-10 relative overflow-hidden`,
          ]}
        >
          <p css={[tw`px-10 pt-7 pb-8 text-4xl leading-tight`]}>
            It’s 8:45AM. You woke up late and need to get to work ASAP for a
            crucial 9AM meeting. You’ve been late two times already, and the
            office is about 2 miles away. How do you get there?
          </p>

          <div css={[tw`w-full bg-gray-400 bg-opacity-50 transform`]}>
            <div
              ref={progressBarRef}
              css={[tw`w-full bg-yellow-400 origin-left`]}
            />
          </div>
        </div>
      </div>

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

export default Question;
