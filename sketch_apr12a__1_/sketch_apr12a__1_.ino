

float area = 15.8;
int switch_pin = 7;
float contagem = 0;
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(switch_pin, INPUT);
}

void loop() {

  int S1Entrada = digitalRead(switch_pin);
  int S4Entrada;
  int S2Corredor;
  int S3Corredor;
  int S5Entrada;
  int clientes = contagem + S4Entrada;
  if (S1Entrada != 1) {

    if (S1Entrada == LOW) {
      contagem++;
    };

    if (contagem != 0) {
      S2Corredor = floor(contagem * .2);
      S3Corredor = floor(contagem * .5);
      S4Entrada = floor(contagem * .6);
      S5Entrada = floor(contagem * 2);
    }

    Serial.print(contagem);
    Serial.print(";");
    Serial.print(S4Entrada);
    Serial.print(";");
    Serial.print(S5Entrada);
    Serial.print(";");
    Serial.print(S2Corredor);
    Serial.print(";");
    Serial.println(S3Corredor);
   
    delay(1000);
  }
}
