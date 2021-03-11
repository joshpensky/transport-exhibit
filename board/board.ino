const int carButtonPin = 2;
const int mbtaButtonPin = 4;
const int bikeButtonPin = 7;

int carButtonState = 0;
int mbtaButtonState = 0;
int bikeButtonState = 0;

bool wasButtonActivated = false;

void setup() {
  // Connect to serial port
  Serial.begin(9600);
  
  // Set the button pins as input
  pinMode(carButtonPin, INPUT_PULLUP);
  pinMode(mbtaButtonPin, INPUT_PULLUP);
  pinMode(bikeButtonPin, INPUT_PULLUP);
}

void loop() {
  wasButtonActivated = false;
  
  int newCarButtonState = digitalRead(carButtonPin);
  if (carButtonState != newCarButtonState) {
    carButtonState = newCarButtonState;

    if (!wasButtonActivated && carButtonState == LOW) {
      Serial.write("C\r\n");
      wasButtonActivated = true;
    }
  }
  
  int newMbtaButtonState = digitalRead(mbtaButtonPin);
  if (mbtaButtonState != newMbtaButtonState) {
    mbtaButtonState = newMbtaButtonState;

    if (!wasButtonActivated && mbtaButtonState == LOW) {
      Serial.write("T\r\n");
      wasButtonActivated = true;
    }
  }
  
  int newBikeButtonState = digitalRead(bikeButtonPin);
  if (bikeButtonState != newBikeButtonState) {
    bikeButtonState = newBikeButtonState;

    if (!wasButtonActivated && bikeButtonState == LOW) {
      Serial.write("B\r\n");
      wasButtonActivated = true;
    }
  }
}
