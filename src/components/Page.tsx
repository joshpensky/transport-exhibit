import { useCallback, useEffect, useRef, useState } from "react";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import DirectionsCarIcon from "@material-ui/icons/DirectionsCar";
import DirectionsSubwayIcon from "@material-ui/icons/DirectionsSubway";
import anime from "animejs";
import tw from "twin.macro";
import { Answer, AnswerData } from "@src/components/Answer";
import { Question } from "@src/components/Question";
import { useSerial } from "@src/providers/SerialProvider";

export type Response = "bike" | "subway" | "car";

interface PageProps {
  onComplete(): void;
  question: string;
  recommended: Response;
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

  const [response, setResponse] = useState<Response | null>(null);

  const respond = useCallback((newResponse: Response) => {
    setResponse((response) => {
      if (response === null) {
        return newResponse;
      }
      return response;
    });
  }, []);

  const [showRecommended, setShowRecommended] = useState(false);

  const onShowCardComplete = () => {
    setTimeout(() => setShowRecommended(true), 1000);
  };

  const [highlighted, setHighlighted] = useState(recommended);

  useEffect(() => {
    if (showRecommended) {
      const timeout = setTimeout(() => {
        setTransitionState("exiting");
      }, 10000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [highlighted, showRecommended]);

  useEffect(() => {
    if (showRecommended) {
      const unsubscribe = subscribe(({ value }) => {
        if (value.startsWith("TURN")) {
          const turnVal = Number.parseInt(value.replace("TURN ", ""));
          if (turnVal >= 682) {
            setHighlighted("bike");
          } else if (turnVal >= 342) {
            setHighlighted("subway");
          } else {
            setHighlighted("car");
          }
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [showRecommended, subscribe]);

  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (response) {
      setIsTimerRunning(false);
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
      let numPunctuationPauses = 0;
      tl.add({
        targets: question?.querySelectorAll("p span"),
        duration: 1,
        opacity: [0, 1],
        delay(el, i) {
          let delay = 40 * i + 500 * numPunctuationPauses;
          if (el.textContent === ".") {
            numPunctuationPauses += 1;
          }
          return delay;
        },
      });
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
      anime({
        targets: page,
        opacity: [1, 0],
        duration: 300,
        easing: "linear",
        delay: 3000,
        complete() {
          setTransitionState("exited");
        },
      });
    }

    if (transitionState === "exited") {
      anime.set(page, { opacity: 0 });
    }
  }, [transitionState, onComplete]);

  // TODO: update animation: fact 1 -> fact 2 -> fact 3 -> hide map + show description + center cards in empty space
  // TODO: add map images
  // TODO: add board diagram to README

  return (
    <div
      ref={pageRef}
      css={[
        tw`absolute inset-0 w-full h-full flex flex-col flex-1 items-center pt-10 px-6 opacity-0 overflow-hidden`,
      ]}
    >
      <div css={tw`flex flex-col flex-1 w-full items-center relative`}>
        <Question
          ref={questionRef}
          question={question}
          isTimerRunning={isTimerRunning}
          onTimeUp={() => {
            setResponse(recommended);
          }}
        />

        <div ref={bodyRef} css={[tw`flex flex-col flex-1 w-full`]}>
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

          <div css={tw`relative flex flex-col flex-1 w-full`}>
            <div
              ref={answersRef}
              css={[
                tw`flex flex-1 justify-center w-full px-16`,
                showRecommended
                  ? tw`items-center`
                  : tw`absolute inset-0 items-end`,
              ]}
            >
              <Answer
                facts={bike.facts}
                description={bike.description}
                serialValue="B"
                icon={DirectionsBikeIcon}
                disabled={!!response || !isTimerRunning}
                selected={response === "bike"}
                showFullCard={!!response}
                recommended={
                  showRecommended && !!response && recommended === "bike"
                }
                dimmed={showRecommended && highlighted !== "bike"}
                onPress={() => respond("bike")}
                onShowComplete={() => onShowCardComplete()}
              >
                Bike
              </Answer>
              <Answer
                facts={subway.facts}
                description={subway.description}
                serialValue="S"
                icon={DirectionsSubwayIcon}
                disabled={!!response || !isTimerRunning}
                selected={response === "subway"}
                showFullCard={!!response}
                recommended={
                  showRecommended && !!response && recommended === "subway"
                }
                dimmed={showRecommended && highlighted !== "subway"}
                onPress={() => respond("subway")}
                onShowComplete={() => onShowCardComplete()}
              >
                Subway
              </Answer>
              <Answer
                facts={car.facts}
                description={car.description}
                serialValue="C"
                icon={DirectionsCarIcon}
                disabled={!!response || !isTimerRunning}
                selected={response === "car"}
                showFullCard={!!response}
                recommended={
                  showRecommended && !!response && recommended === "car"
                }
                dimmed={showRecommended && highlighted !== "car"}
                onPress={() => respond("car")}
                onShowComplete={() => onShowCardComplete()}
              >
                Car
              </Answer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
