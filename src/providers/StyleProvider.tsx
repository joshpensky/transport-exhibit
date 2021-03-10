import { Fragment, ReactNode } from "react";
import { createGlobalStyle } from "styled-components";
import tw, { GlobalStyles as GlobalTwinStyles } from "twin.macro";

const GlobalCustomStyles = createGlobalStyle`
  body {
    ${tw`bg-indigo-800`};
    ${tw`font-sans`}
    ${tw`text-white`}
  }
`;

export type StyleProviderProps = {
  children: ReactNode;
};
const StyleProvider = ({ children }: StyleProviderProps) => (
  <Fragment>
    <GlobalTwinStyles />
    <GlobalCustomStyles />
    {children}
  </Fragment>
);

export default StyleProvider;
