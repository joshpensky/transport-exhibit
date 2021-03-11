import { useCallback, useEffect, useState } from "react";
import { SerialMessage, useSerial } from "@src/providers/SerialProvider";

const useButtonPress = (value: string) => {
  const { subscribe } = useSerial();

  const [isPressed, setIsPressed] = useState(false);

  const onMessage = useCallback(
    /**
     * Updates the pressed state of the button when it receives
     * a message matching the given value.
     *
     * @param message the incoming serial message
     */
    (message: SerialMessage) => {
      if (message.value === value) {
        setIsPressed(true);
      }
    },
    [value]
  );

  // Simulate a button press-and-release state (about 150ms)
  useEffect(() => {
    if (isPressed) {
      setTimeout(() => {
        setIsPressed(false);
      }, 150);
    }
  }, [isPressed]);

  // Wait for the button press message
  useEffect(() => {
    if (!isPressed) {
      const unsubscribe = subscribe(onMessage);
      return () => {
        unsubscribe();
      };
    }
  }, [subscribe, onMessage, isPressed]);

  return isPressed;
};

export default useButtonPress;
