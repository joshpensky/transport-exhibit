import { useAnswer } from "@src/providers/AnswerProvider";
import { PropsWithChildren } from "react";
import tw from "twin.macro";

interface HighlightProps {
  type: "good" | "bad";
}

export const Highlight = ({
  children,
  type,
}: PropsWithChildren<HighlightProps>) => {
  const { isHighlighted } = useAnswer();

  return (
    <span
      css={[
        tw`px-1 pb-1 rounded`,
        type === "good" && isHighlighted ? tw`bg-white` : tw`bg-lime-400`,
        type === "bad" && tw`text-white font-light bg-red-400`,
      ]}
    >
      {children}
    </span>
  );
};
