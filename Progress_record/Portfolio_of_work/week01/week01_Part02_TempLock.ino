int switchS = 0;
int i= -1;
const int sPin = A2; //sPin==SensorPin
const int bPin = A1;
const double bTemp = 20.00; //cancel comment line of thhis line, if a const is needed in simulaters(tinkercad)

int count = 0;



void setup() {
Serial.begin(9600);

for (int tempind = 2; tempind < 7; tempind++) //tempind == temperature indicator
{
  pinMode (tempind, OUTPUT);
}

for (int digit = 8; digit < 13 ;digit++) //digit == blue lights shows which digit is being input
{
  pinMode (digit, OUTPUT);
}

pinMode (7, INPUT);

}

void loop() {
delay(20);
switchS = digitalRead(7);
int sVal = analogRead(sPin); //sVal== Sensor Value




//Below here
/*
int bVal = analogRead(bPin); //Btemp == BaseTemperature
float bVoltage = (bVal/1024.0)*5.0;
float bTemp = (bVoltage- .5)*100;
*/
//Above here, if to use a const baseline temp, please comment line these.

Serial.print("bTemp: ");
Serial.print(bTemp);


/*
Serial.print("Sensored Temp: ");
Serial.print(sVal);
//not for display
*/

double voltage = (sVal/1024.0) * 5.0;

/*
Serial.print(",Volts: ");
Serial.print(voltage);
//not for display
*/

Serial.print(", degree C; ");
double sTemp = (voltage - .5) * 100;
//sTemp = int(sTemp * 10000)/10000;
Serial.println(sTemp);


Serial.print("dTemp: ");
double dTemp = (sTemp - bTemp);
//dTemp = 1.0*(int)(dTemp*100)/100;
Serial.println(dTemp);

  
for (double t= 1.00; t<6.00; t++)
{
  boolean cmptemp = ((dTemp >= t) && (dTemp < t+1));
  if(cmptemp == true)
  {
  digitalWrite(t+1, cmptemp*5);
  digitalWrite(t, cmptemp*5);
  digitalWrite(t-1, cmptemp*5);
  digitalWrite(t-2, cmptemp*5);
  digitalWrite(t-3, cmptemp*5);
  }
}

if (dTemp < 1)
{
  digitalWrite(6,LOW);
  digitalWrite(2,LOW);
  digitalWrite(3,LOW);
  digitalWrite(4,LOW);
  digitalWrite(5,LOW);

}

if (dTemp >= 6)
{
  digitalWrite(2,HIGH);
  digitalWrite(3,HIGH);
  digitalWrite(4,HIGH);
  digitalWrite(5,HIGH);
  digitalWrite(6,HIGH);

  delay(200);

  digitalWrite(2,LOW);
  digitalWrite(3,LOW);
  digitalWrite(4,LOW);
  digitalWrite(5,LOW);
  digitalWrite(6,LOW);

  delay(200);
}

if (switchS == 1)
{
  while(1)
  {
    switchS=digitalRead(7);
    delay(20);
    if(switchS==0)
      break;
  }
  i=-i;
  count++;
}


if(i==1)
{
    for(int digit = count+7; digit<count+12; digit++)
    {
      digitalWrite(digit, HIGH);
      /*
      This is where the dTemp should be stored into the first digit of password.
      */
      break;
    }
    i=-i;
}

  //the code can continue once I know how to store and read datas
  
  /*
  if (count == 4)
  {
    if (compare int array ((setpasscode[5],inputpasscode[5]) == 0))
    {
      return 1;//passcode is right
    }
    else
    {
      return 0;//passcode is wrong
    }
  }
  */


}