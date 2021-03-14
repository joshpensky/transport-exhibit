import { createContext, useContext } from "react";

export const AnswerContext = createContext({ isHighlighted: false });

export const useAnswer = () => useContext(AnswerContext);

export const AnswerProvider = AnswerContext.Provider;
