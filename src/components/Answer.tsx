import { PropsWithChildren, useEffect, useRef } from "react";
import type { SvgIconTypeMap } from "@material-ui/core";
import type { OverridableComponent } from "@material-ui/core/OverridableComponent";
import tw from "twin.macro";
import useButtonPress from "@src/hooks/useButtonPress";
import anime from "animejs";

interface AnswerProps {
  disabled?: boolean;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  onPress(): void;
  selected?: boolean;
  value: string;
}
export const Answer = ({
  children,
  disabled,
  icon: Icon,
  onPress,
  selected,
  value,
}: PropsWithChildren<AnswerProps>) => {
  const isPressed = useButtonPress(value);

  const headerTitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) {
      const headerTitle = headerTitleRef.current;

      anime({
        targets: headerTitle,
        left: ["50%", "0%"],
        translateX: ["-50%", "0%"],
        duration: 300,
        easing: "easeOutCirc",
      });

      return () => {
        anime({
          targets: headerTitle,
          left: ["0%", "50%"],
          translateX: ["0%", "-50%"],
          duration: 300,
          easing: "easeOutCirc",
        });
      };
    }
  }, [selected]);

  useEffect(() => {
    if (!disabled && isPressed) {
      onPress();
    }
  }, [disabled, isPressed, onPress]);

  return (
    <div
      css={[
        tw`flex flex-col w-full p-8 rounded-t-3xl`,
        tw`transition-colors bg-white text-green-900 ring ring-green-900`,
        tw`mx-6 first:ml-0 last:mr-0`,
        selected && tw`bg-lime-400`,
      ]}
    >
      <header css={[tw`flex items-center justify-end h-14 relative`]}>
        <div
          ref={headerTitleRef}
          css={[
            tw`flex items-center absolute top-0 left-1/2 transform -translate-x-1/2`,
          ]}
        >
          <div css={[tw`w-14 h-14`]}>
            <Icon style={{ width: "100%", height: "100%" }} />
          </div>
          <p css={[tw`text-3xl ml-4`]}>{children}</p>
        </div>

        <div
          css={[
            tw`font-semibold tracking-wider mt-1 px-3 py-1 bg-green-900 text-white text-lg rounded-lg uppercase`,
            tw`opacity-0 transition-all duration-300 transform translate-x-4`,
            selected && tw`opacity-100 translate-x-0 text-lime-400`,
          ]}
          aria-hidden={!selected}
        >
          Selected
        </div>
      </header>
    </div>
  );
};
