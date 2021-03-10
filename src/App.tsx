import SerialProvider from "@src/providers/SerialProvider";
import Question from "@src/components/Question";
import StyleProvider from "@src/providers/StyleProvider";
import SerialLoader from "@src/components/SerialLoader";

const App = () => (
  <StyleProvider>
    <SerialProvider>
      <SerialLoader>
        <Question />
      </SerialLoader>
    </SerialProvider>
  </StyleProvider>
);

export default App;
