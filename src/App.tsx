import { useState } from "react";
import tw from "twin.macro";
import Page from "@src/components/Page";
import SerialLoader from "@src/components/SerialLoader";
import { data } from "@src/data";
import StyleProvider from "@src/providers/StyleProvider";
import SerialProvider from "@src/providers/SerialProvider";

const App = () => {
  const [slideIndex, setSlideIndex] = useState(0);

  const onComplete = () => {
    setSlideIndex((index) => (index + 1) % data.length);
  };

  return (
    <StyleProvider>
      <SerialProvider>
        <div
          css={[
            tw`flex flex-col flex-1 min-h-screen items-center justify-center`,
          ]}
        >
          <div css={[tw`relative bg-green-900 width[1920px] height[1080px]`]}>
            <SerialLoader>
              {data.map((slide, index) => {
                if (index !== slideIndex) {
                  return null;
                }
                return (
                  <Page
                    key={slide.id}
                    question={slide.question}
                    recommended={slide.recommended}
                    map={slide.map}
                    bike={{
                      facts: slide.facts.map((fact) => ({
                        label: fact.label,
                        value: fact.bike,
                      })),
                      description: slide.descriptions.bike,
                    }}
                    subway={{
                      facts: slide.facts.map((fact) => ({
                        label: fact.label,
                        value: fact.subway,
                      })),
                      description: slide.descriptions.subway,
                    }}
                    car={{
                      facts: slide.facts.map((fact) => ({
                        label: fact.label,
                        value: fact.car,
                      })),
                      description: slide.descriptions.car,
                    }}
                    onComplete={onComplete}
                  />
                );
              })}
            </SerialLoader>
          </div>
        </div>
      </SerialProvider>
    </StyleProvider>
  );
};

export default App;
