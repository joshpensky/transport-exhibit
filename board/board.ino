const int bikeButtonPin = 7;
const int subwayButtonPin = 4;
const int carButtonPin = 2;

int bikeButtonState = 0;
int subwayButtonState = 0;
int carButtonState = 0;

// int knobPosition = 0;

bool wasButtonActivated = false;

void setup()
{
  // Connect to serial port
  Serial.begin(9600);

  // Set the button pins as input
  pinMode(carButtonPin, INPUT_PULLUP);
  pinMode(subwayButtonPin, INPUT_PULLUP);
  pinMode(bikeButtonPin, INPUT_PULLUP);
}

void loop()
{
  wasButtonActivated = false;

  int newBikeButtonState = digitalRead(bikeButtonPin);
  if (bikeButtonState != newBikeButtonState)
  {
    bikeButtonState = newBikeButtonState;

    if (!wasButtonActivated && bikeButtonState == LOW)
    {
      Serial.write("B\r\n");
      wasButtonActivated = true;
    }
  }

  int newSubwayButtonState = digitalRead(subwayButtonPin);
  if (subwayButtonState != newSubwayButtonState)
  {
    subwayButtonState = newSubwayButtonState;

    if (!wasButtonActivated && subwayButtonState == LOW)
    {
      Serial.write("S\r\n");
      wasButtonActivated = true;
    }
  }

  int newCarButtonState = digitalRead(carButtonPin);
  if (carButtonState != newCarButtonState)
  {
    carButtonState = newCarButtonState;

    if (!wasButtonActivated && carButtonState == LOW)
    {
      Serial.write("C\r\n");
      wasButtonActivated = true;
    }
  }

  // int newKnobPosition = analogRead(A0);
  // if (newKnobPosition < knobPosition - 2 || newKnobPosition > knobPosition + 2)
  // {
  //   knobPosition = newKnobPosition;

  //   char messageChars[15];
  //   String message = "TURN ";
  //   message = message + knobPosition;
  //   message = message + "\r\n";
  //   message.toCharArray(messageChars, 15);

  //   Serial.write(messageChars);
  // }
}
