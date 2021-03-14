import { useCallback, useEffect, useRef, useState } from "react";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import DirectionsCarIcon from "@material-ui/icons/DirectionsCar";
import DirectionsSubwayIcon from "@material-ui/icons/DirectionsSubway";
import anime from "animejs";
import tw from "twin.macro";
import { Answer, AnswerData } from "@src/components/Answer";
import { Question } from "@src/components/Question";
import { useSerial } from "@src/providers/SerialProvider";

interface PageProps {
  onComplete(): void;
  question: string;
  recommended: "bike" | "subway" | "car";
  bike: AnswerData;
  subway: AnswerData;
  car: AnswerData;
}

type TransitionState = "entering" | "entered" | "exiting" | "exited";

const Page = ({
  bike,
  subway,
  car,
  onComplete,
  question,
  recommended,
}: PageProps) => {
  const { subscribe } = useSerial();

  const pageRef = useRef<HTMLDivElement>(null);
  const [transitionState, setTransitionState] = useState<TransitionState>(
    "entering"
  );

  const questionRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const answersRef = useRef<HTMLDivElement>(null);

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

  // Handles page functionality based on state
  useEffect(() => {
    switch (transitionState) {
      case "entered": {
        setIsTimerRunning(true);
        break;
      }

      case "exited": {
        onComplete();
        break;
      }
    }
  }, [onComplete, transitionState]);

  // Handles page transitions based on state
  useEffect(() => {
    const page = pageRef.current;
    const question = questionRef.current;
    const body = bodyRef.current;
    const answers = answersRef.current;

    if (transitionState === "entering") {
      anime.set(question, {
        position: "absolute",
        left: "50%",
        top: "50%",
        translateX: "-50%",
        translateY: "-50%",
      });

      const tl = anime.timeline();
      tl.add({
        targets: page,
        opacity: [0, 1],
        duration: 300,
        easing: "linear",
        delay: 500,
        endDelay: 500,
      });
      // Animate question text coming in
      // let numPunctuationPauses = 0;
      // tl.add({
      //   targets: question?.querySelectorAll("p span"),
      //   duration: 1,
      //   opacity: [0, 1],
      //   delay(el, i) {
      //     let delay = 40 * i + 500 * numPunctuationPauses;
      //     if (el.textContent === ".") {
      //       numPunctuationPauses += 1;
      //     }
      //     return delay;
      //   },
      // });
      // Animate question move to top
      tl.add({
        targets: question,
        top: ["50%", "0%"],
        translateY: ["-50%", "0%"],
        duration: 1000,
        delay: 1000,
        easing: "easeInOutCubic",
        complete() {
          // Reset styles
          if (question) {
            question.style.position = "";
            question.style.transform = "";
            question.style.top = "";
            question.style.left = "";
          }
        },
      });
      // Animate body opacity
      tl.add({
        targets: body,
        opacity: [0, 1],
        duration: 300,
        easing: "linear",
      });
      // Animate buttons popping up
      tl.add(
        {
          targets: answers,
          translateY: ["100%", "0%"],
          duration: 1000,
          endDelay: 1000,
          easing: "easeInOutCubic",
        },
        "-=300"
      );
      tl.finished.then(() => {
        setTransitionState("entered");
      });
    }

    if (transitionState === "entered") {
      anime.set(page, { opacity: 1 });
    }

    if (transitionState === "exiting") {
      // anime({
      //   targets: page,
      //   opacity: [1, 0],
      //   duration: 300,
      //   easing: "linear",
      //   delay: 1000,
      //   complete() {
      //     setTransitionState("exited");
      //   },
      // });
    }

    if (transitionState === "exited") {
      anime.set(page, { opacity: 0 });
    }
  }, [transitionState, onComplete]);

  return (
    <div
      ref={pageRef}
      css={[
        tw`flex flex-col flex-1 items-center pt-10 px-6 opacity-0 min-h-screen overflow-hidden`,
      ]}
    >
      <div css={tw`flex flex-col flex-1 w-full items-center relative`}>
        <Question
          ref={questionRef}
          question={question}
          isTimerRunning={isTimerRunning}
          onTimeUp={() => {
            // TODO: change to show recommended answer
            setResponse("B");
          }}
        />

        <div ref={bodyRef}>
          <div css={[tw`absolute inset-0 flex flex-1 w-full px-28 pt-24`]}>
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
            ref={answersRef}
            css={[
              tw`absolute inset-0 flex items-end justify-center w-full px-16`,
            ]}
          >
            <Answer
              facts={bike.facts}
              description={bike.description}
              value="B"
              icon={DirectionsBikeIcon}
              disabled={!!response || !isTimerRunning}
              selected={response === "B"}
              showFullCard={!!response}
              recommended={!!response && recommended === "bike"}
              onPress={() => respond("B")}
            >
              Bike
            </Answer>
            <Answer
              facts={subway.facts}
              description={subway.description}
              value="T"
              icon={DirectionsSubwayIcon}
              disabled={!!response || !isTimerRunning}
              selected={response === "T"}
              showFullCard={!!response}
              recommended={!!response && recommended === "subway"}
              onPress={() => respond("T")}
            >
              Subway
            </Answer>
            <Answer
              facts={car.facts}
              description={car.description}
              value="C"
              icon={DirectionsCarIcon}
              disabled={!!response || !isTimerRunning}
              selected={response === "C"}
              showFullCard={!!response}
              recommended={!!response && recommended === "car"}
              onPress={() => respond("C")}
            >
              Car
            </Answer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
