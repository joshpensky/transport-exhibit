import {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SvgIconTypeMap } from "@material-ui/core";
import type { OverridableComponent } from "@material-ui/core/OverridableComponent";
import tw from "twin.macro";
import useButtonPress from "@src/hooks/useButtonPress";
import anime from "animejs";
import { AnswerProvider } from "@src/providers/AnswerProvider";
import { getElHeight } from "@src/utils/getElHeight";

export interface AnswerData {
  facts: {
    label: ReactNode;
    value: ReactNode;
  }[];
  description: ReactNode;
}

interface AnswerProps extends AnswerData {
  dimmed?: boolean;
  disabled?: boolean;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  onPress(): void;
  onShowComplete(portion: "facts" | "card"): void;
  recommended?: boolean;
  selected?: boolean;
  showFullCard?: boolean;
  serialValue: string;
}
export const Answer = ({
  children,
  description,
  dimmed,
  disabled,
  facts,
  icon: Icon,
  onPress,
  recommended,
  selected,
  showFullCard,
  onShowComplete,
  serialValue,
}: PropsWithChildren<AnswerProps>) => {
  const isPressed = useButtonPress(serialValue);

  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const setListItemRef = (el: HTMLLIElement | null, index: number) => {
    listItemRefs.current[index] = el;
  };

  const headerTitleRef = useRef<HTMLDivElement>(null);

  const [showIndex, setShowIndex] = useState(0);

  useEffect(() => {
    if (showFullCard && showIndex === 0) {
      setShowIndex(1);
    }
  }, [showFullCard, showIndex]);

  useEffect(() => {
    const card = cardRef.current;
    const header = headerRef.current;
    const listItems = listItemRefs.current;

    let visibleHeight = 3 + getElHeight(header);

    if (showIndex === 0) {
      anime.set(card, {
        translateY: `calc(100% - ${visibleHeight}px)`,
      });
      return;
    }

    if (showIndex <= listItems.length + 1) {
      // Update height
      if (showIndex <= listItems.length) {
        visibleHeight += 3; // account for border
        for (let i = 0; i < Math.min(listItems.length, showIndex); i++) {
          visibleHeight += getElHeight(listItems[i]);
        }
      } else {
        visibleHeight = getElHeight(card); // just equal to card height
      }

      anime({
        targets: card,
        translateY: `calc(100% - ${visibleHeight}px)`,
        duration: 500,
        delay: showIndex === 1 ? 1500 : 1000,
        easing: "easeOutCubic",
        complete: () => {
          if (showIndex <= listItems.length) {
            setShowIndex(showIndex + 1);
            if (showIndex === listItems.length) {
              onShowComplete("facts");
            }
          } else {
            onShowComplete("card");
          }
        },
      });
      return;
    }
  }, [showIndex, onShowComplete]);

  // Plays the header title move animation on select/recommend
  useEffect(() => {
    // Only run header animation once (either on select or recommend)
    // Prevents animation from being run twice on recommended selections
    if ((selected && !recommended) || (recommended && !selected)) {
      const headerTitle = headerTitleRef.current;

      anime({
        targets: headerTitle,
        left: ["50%", "0%"],
        translateX: ["-50%", "0%"],
        duration: 300,
        easing: "easeOutCirc",
      });
    }
  }, [selected, recommended]);

  // Calls the `onPress` event handler on serial button press
  useEffect(() => {
    if (!disabled && isPressed) {
      onPress();
    }
  }, [disabled, isPressed, onPress]);

  return (
    <AnswerProvider value={{ isHighlighted: !!selected }}>
      <div
        css={[
          tw`w-full mx-6 first:ml-0 last:mr-0 transition-all duration-300 transform`,
          dimmed && tw`opacity-50 scale-95`,
        ]}
      >
        <div
          ref={cardRef}
          css={[
            tw`flex flex-col w-full rounded-3xl`,
            tw`transition-all bg-white text-green-900 border-3 border-green-900 ring-0 ring-lime-400`,
            tw`transition-property[box-shadow, background-color]`,
            selected && tw`bg-lime-400`,
            recommended && tw`ring-8`,
          ]}
        >
          <header ref={headerRef} css={[tw`py-8 px-10`]}>
            <div css={[tw`flex items-center justify-end h-14 relative`]}>
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
                  (selected || recommended) && tw`opacity-100 translate-x-0`,
                  selected && tw`text-lime-400`,
                ]}
              >
                {recommended ? "Recommended" : "Selected"}
              </div>
            </div>
          </header>

          <ul css={[tw`px-10 border-t-3 border-green-900 text-3xl`]}>
            {facts.map((fact, index) => (
              <li
                key={index}
                ref={(el) => setListItemRef(el, index)}
                css={tw`flex justify-between py-6 first:pt-8 last:pb-8`}
              >
                <p>{fact.label}</p>
                <p>{fact.value}</p>
              </li>
            ))}
          </ul>

          <div
            css={[
              tw`py-8 px-10 border-t-3 border-green-900 text-3xl leading-snug`,
            ]}
          >
            {description}
          </div>
        </div>
      </div>
    </AnswerProvider>
  );
};
