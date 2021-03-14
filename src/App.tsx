import SerialProvider from "@src/providers/SerialProvider";
import Page from "@src/components/Page";
import StyleProvider from "@src/providers/StyleProvider";
import SerialLoader from "@src/components/SerialLoader";
import { useState } from "react";
import { data } from "@src/data";

const App = () => {
  const [slideIndex, setSlideIndex] = useState(2);

  const onComplete = () => {
    setSlideIndex((index) => (index + 1) % data.length);
  };

  return (
    <StyleProvider>
      <SerialProvider>
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
      </SerialProvider>
    </StyleProvider>
  );
};

export default App;
