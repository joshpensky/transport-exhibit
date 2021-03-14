import { ReactNode } from "react";
import { Highlight } from "@src/components/Highlight";

interface Slide {
  id: string;
  question: string;
  recommended: "bike" | "subway" | "car";
  facts: {
    label: ReactNode;
    bike: ReactNode;
    subway: ReactNode;
    car: ReactNode;
  }[];
  descriptions: {
    bike: ReactNode;
    subway: ReactNode;
    car: ReactNode;
  };
}

export const data: Slide[] = [
  {
    id: "reservations",
    question:
      "You have dinner reservations with your friend in Fenway. You live in Allston about 2 miles away. How do you get there?",
    recommended: "bike",
    facts: [
      {
        label: "ETA",
        bike: "12 min",
        subway: "28 min",
        car: "9 min",
      },
      {
        label: "Cost",
        bike: "$0",
        subway: "$2.40",
        car: "$0.38",
      },
      {
        label: (
          <span>
            CO<sub>2</sub> emissions
          </span>
        ),
        bike: "0g",
        subway: "0g",
        car: "1373.6g",
      },
    ],
    descriptions: {
      bike: (
        <p>
          You majorly <Highlight type="good">saved on emissions</Highlight> by
          choosing to bike and were still able to{" "}
          <Highlight type="good">make it on time</Highlight> similar to a car!
        </p>
      ),
      subway: (
        <p>
          You <Highlight type="good">saved on emissions</Highlight> by choosing
          the subway! But <Highlight type="bad">you were late</Highlight> to the
          restaurant and they gave your table away.
        </p>
      ),
      car: (
        <p>
          You{" "}
          <Highlight type="bad">
            released over 1kg of CO<sub>2</sub>
          </Highlight>{" "}
          into the air! You <Highlight type="good">made it on time</Highlight>{" "}
          to the restaurant, but was this the only way?
        </p>
      ),
    },
  },
  {
    id: "distant-travel",
    question:
      "You have plans to hang out with your friends at their place in Somerville. You plan on leaving your home in Jamaica Plain at noon. How do you get there?",
    recommended: "subway",
    facts: [
      {
        label: "ETA",
        bike: "12:43PM",
        subway: "12:44PM",
        car: "12:28PM",
      },
      {
        label: "Cost",
        bike: "$0",
        subway: "$2.40",
        car: "$0.88",
      },
      {
        label: (
          <span>
            CO<sub>2</sub> emissions
          </span>
        ),
        bike: "0g",
        subway: "0g",
        car: "3191.6g",
      },
    ],
    descriptions: {
      bike: (
        <p>
          You <Highlight type="good">saved on emissions</Highlight> by choosing
          to bike! But <Highlight type="bad">you were exhausted</Highlight> from
          the 7 mile ride and couldn't bike back home.
        </p>
      ),
      subway: (
        <p>
          You <Highlight type="good">saved on emissions</Highlight> by choosing
          the subway and still{" "}
          <Highlight type="good">arrived at a reasonable time</Highlight> to
          hang with your friends.
        </p>
      ),
      car: (
        <p>
          You were able to drive there in{" "}
          <Highlight type="good">the fastest time</Highlight>! But in doing so,
          you{" "}
          <Highlight type="bad">
            released over 3kg of CO<sub>2</sub>
          </Highlight>{" "}
          into the air. Was the speed necessary?
        </p>
      ),
    },
  },
  {
    id: "late-to-work",
    question:
      "It’s 8:45AM. You woke up late and need to get to work ASAP for a crucial 9AM meeting. You’ve been late two times already, and the office is about 2 miles away. How do you get there?",
    recommended: "car",
    facts: [
      {
        label: "ETA",
        bike: "9:04AM",
        subway: "9:05AM",
        car: "8:56AM",
      },
      {
        label: "Cost",
        bike: "$0",
        subway: "$2.40",
        car: "$0.26",
      },
      {
        label: (
          <span>
            CO<sub>2</sub> emissions
          </span>
        ),
        bike: "0g",
        subway: "0g",
        car: "929.2g",
      },
    ],
    descriptions: {
      bike: (
        <p>
          You <Highlight type="good">saved on emissions</Highlight> by choosing
          to bike! But your boss was upset that{" "}
          <Highlight type="bad">you were late</Highlight> again and missed your
          meeting.
        </p>
      ),
      subway: (
        <p>
          You <Highlight type="good">saved on emissions</Highlight> by choosing
          to bike! But your boss was upset that{" "}
          <Highlight type="bad">you were late</Highlight> again and missed your
          meeting.
        </p>
      ),
      car: (
        <p>
          You{" "}
          <Highlight type="bad">
            released nearly 1kg of CO<sub>2</sub>
          </Highlight>{" "}
          into the air! But you made it into work on time and{" "}
          <Highlight type="good">saved your job</Highlight>. We all have to live
          somehow.
        </p>
      ),
    },
  },
];
