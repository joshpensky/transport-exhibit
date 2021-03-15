import SerialProvider from "@src/providers/SerialProvider";
import Page from "@src/components/Page";
import StyleProvider from "@src/providers/StyleProvider";
import SerialLoader from "@src/components/SerialLoader";
import { useState } from "react";
import { data } from "@src/data";
import tw from "twin.macro";

const App = () => {
  const [slideIndex, setSlideIndex] = useState(0);

  const onComplete = () => {
    setSlideIndex((index) => (index + 1) % data.length);
  };

  return (
    <StyleProvider>
      <SerialProvider>
        <SerialLoader>
          <div css={[tw`relative`, { width: 1920, height: 1080 }]}>
            {data.map((slide, index) => {
              if (index !== slideIndex) {
                return null;
              }
              return (
                <Page
                  key={slide.id}
                  question={slide.question}
                  recommended={slide.recommended}
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
          </div>
        </SerialLoader>
      </SerialProvider>
    </StyleProvider>
  );
};

export default App;
