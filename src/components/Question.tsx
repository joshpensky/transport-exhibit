import { useEffect, useRef } from "react";
import anime from "animejs";
import tw, { theme } from "twin.macro";

const ANSWER_TIME_SEC = 10;
const PROGRESS_BAR_HEIGHT = theme`height.7`;

interface QuestionProps {
  isTimerRunning?: boolean;
  onTimeUp(): void;
  question: string;
}

export const Question = ({
  isTimerRunning,
  onTimeUp,
  question,
}: QuestionProps) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const animeRef = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      const progressBar = progressBarRef.current;
      const tl = anime.timeline();

      new Promise<void>(async (resolve) => {
        if (animeRef.current && !animeRef.current.completed) {
          await animeRef.current.finished;
        }
        animeRef.current = null;

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
        tl.finished.then(onTimeUp);

        resolve();
      });

      return () => {
        tl.pause();
        animeRef.current = anime({
          targets: progressBar,
          height: [PROGRESS_BAR_HEIGHT, 0],
          opacity: [1, 0],
          easing: "easeOutCirc",
          duration: 300,
        });
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning]);

  return (
    <div
      css={[
        tw`flex flex-col w-full max-w-6xl rounded-3xl bg-white ring ring-green-900 z-10 relative overflow-hidden`,
      ]}
    >
      <p css={[tw`px-10 pt-7 pb-8 text-4xl leading-tight`]}>{question}</p>

      <div css={[tw`w-full bg-gray-400 bg-opacity-50 transform`]}>
        <div
          ref={progressBarRef}
          css={[tw`w-full bg-yellow-400 origin-left`]}
        />
      </div>
    </div>
  );
};
