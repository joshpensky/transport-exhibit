import SerialProvider from "@src/providers/SerialProvider";
import Page from "@src/components/Page";
import StyleProvider from "@src/providers/StyleProvider";
import SerialLoader from "@src/components/SerialLoader";
import { useState } from "react";

const slides = [
  {
    id: "reservations",
    question:
      "You have dinner reservations with your friend in Fenway. You live in Allston about 2 miles away. How do you get there?",
  },
  {
    id: "distant-travel",
    question:
      "You have plans to hang out with your friends at their place in Somerville. You plan on leaving your home in Jamaica Plain at noon. How do you get there?",
  },
  {
    id: "late-to-work",
    question:
      "It’s 8:45AM. You woke up late and need to get to work ASAP for a crucial 9AM meeting. You’ve been late two times already, and the office is about 2 miles away. How do you get there?",
  },
];

const App = () => {
  const [slideIndex, setSlideIndex] = useState(0);

  const onComplete = () => {
    setSlideIndex((index) => (index + 1) % slides.length);
  };

  return (
    <StyleProvider>
      <SerialProvider>
        <SerialLoader>
          {slides.map((slide, index) => {
            if (index !== slideIndex) {
              return null;
            }
            return (
              <Page
                key={slide.id}
                question={slide.question}
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
