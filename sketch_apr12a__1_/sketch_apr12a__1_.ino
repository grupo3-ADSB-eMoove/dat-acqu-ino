

float area = 15.8;
int switch_pin = 7;
int contador = 0;
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(switch_pin, INPUT);
}

void loop() {
  int contagem = 0;
  int S1Entrada = digitalRead(switch_pin);
  int S4Entrada = 0;
  int S2Corredor = 0;
  int S3Corredor = 0;
  int S5Entrada = 0;
  int clientes = contagem + S4Entrada;
  if (S1Entrada != 1) {

    if (S1Entrada == LOW) {
      contagem = 1;
      contador++;
    };

    if (contagem != 0) {
      if(contador == 3){
         S4Entrada = 1;
         contador = 0;
      }
      
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
    S4Entrada = 0;
  delay(1000);
  }
}
