#include <ArduinoJson.h> 
#include <SPI.h> 
#include <WiFi101.h> 
#include "arduino_secrets.h"

char ssid[] = SECRET_SSID;      // Change your network SSID in arduino_secrets.h
char pass[] = SECRET_PSW;   // Change your password in arduino_secrets.h
String apiKey= SECRET_APIKEY; //Change your api key in arduino_secrets.h
int keyIndex = 0;                 
int status = WL_IDLE_STATUS; //status of wifi
String location= "Beijing,CN"; //Change the city you live in
char WeatherServer[] = "api.openweathermap.org";     
WiFiClient WeatherClient; 
WiFiServer server(80); //declare server object and spedify port, 80 is port used for internet



void setup() {
  pinMode(5,OUTPUT);  
  pinMode(4,OUTPUT);
  pinMode(3,OUTPUT);
  pinMode(2,OUTPUT);
  pinMode(1,OUTPUT);
  //Uncomment serial for debugging and to see details of WiFi connection
  Serial.begin(9600);
  //while (!Serial) {
     // wait for serial port to connect. Needed for native USB port only
//  }

  // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue:
    while (true);
  }

  // attempt to connect to Wifi network:
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
    delay(5000);
  }
  server.begin();
  // you're connected now, so print out the status:
  printWifiStatus();
}


void loop() {
  WiFiClient client = server.available();   
  
  if (client) {                            
   // Serial.println("new client");         
    String currentLine = "";              
    while (client.connected()) {       
      if (client.available()) {           
        char c = client.read();           
       // Serial.write(c);                
        if (c == '\n') {                  
          if (currentLine.length() == 0) {
            client.println();
            client.print("Device conncted");
            client.println();
            break;
          }
          else {     
            currentLine = "";
          }
        }
        else if (c != '\r') {    
          currentLine += c;   
        }

        if (currentLine.endsWith("GET /H5")) {
          digitalWrite(5, HIGH);
          client.println("Your Fragrance for a Clear day is On.");
          delay(500); 
        }
        if (currentLine.endsWith("GET /L5")) {
          digitalWrite(5, LOW);
          client.print("Your Fragrance for a Clear day is Off.");
          delay(500); 
        }
        if (currentLine.endsWith("GET /H4")) {
          digitalWrite(4, HIGH);
          client.println("Your Fragrance for a Clouds day is On.");
          delay(500); 
        }
        if (currentLine.endsWith("GET /L4")) {
          digitalWrite(4, LOW);
          client.println("Your Fragrance for a Clouds day is Off.");
          delay(500); 
        } 
        if (currentLine.endsWith("GET /H3")) {
          digitalWrite(3, HIGH);
          client.println("Your Fragrance for a Rainy day is On.");
          delay(500); 
        }
        if (currentLine.endsWith("GET /L3")) {
          digitalWrite(3, LOW);
          client.println("Your Fragrance for a Rainy day is Off.");
          delay(500); 
        } 
        if (currentLine.endsWith("GET /H2")) {
          digitalWrite(2, HIGH);
          client.println("Good Morning.");
          delay(500); 
        }
        if (currentLine.endsWith("GET /L2")) {
          digitalWrite(2, LOW);
          client.println("Your Morning fragrance is Off.");
          delay(500); 
        } 
        if (currentLine.endsWith("GET /H1")) {
          digitalWrite(1, HIGH);
          client.println("Your Evening fragrance is On.");
          delay(500);
        }
        if (currentLine.endsWith("GET /L1")) {
          digitalWrite(1, LOW);
          client.println("Good Night.");
          delay(500);
        } 
        if (currentLine.endsWith("GET /Hall")) {
          digitalWrite(5, HIGH);
          digitalWrite(4, HIGH);
          digitalWrite(3, HIGH);
          digitalWrite(2, HIGH);
          digitalWrite(1, HIGH);
          client.println("All of your fragrances are on.");
          delay(500); 
        }
        if (currentLine.endsWith("GET /Lall")) {
          digitalWrite(5, LOW);
          digitalWrite(4, LOW);
          digitalWrite(3, LOW);
          digitalWrite(2, LOW);
          digitalWrite(1, LOW);
          client.println("All of your fragrances are Off.");
          delay(500);
        }       
        if (currentLine.endsWith("GET /WeatherOn")) {
          client.println("Turning on Weather Mode.");
          getWeather(); 
          delay(500);
          continue;
        }               
      }
    }
    // close the connection:
    client.stop();
   // Serial.println("client disconnected");
  }
}


void printWifiStatus() {
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());


  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

void getWeather() { 
 Serial.println("\nStarting connection to server..."); 
 // if you get a connection, report back via serial: 
if(!(WeatherClient.connected())){
 if (WeatherClient.connect(WeatherServer, 80)) { 
   Serial.println("connected to server"); 
   // Make a HTTP request: 
   WeatherClient.print("GET /data/2.5/forecast?"); 
   WeatherClient.print("q="+location); 
   WeatherClient.print("&appid="+apiKey); 
   WeatherClient.print("&cnt=3"); 
   WeatherClient.println("&units=metric"); 
   WeatherClient.println("Host: api.openweathermap.org"); 
   WeatherClient.println("Connection: close"); 
   WeatherClient.println(); 
 } else { 
   Serial.println("unable to connect"); 
 } 
}
 String line = ""; 
 while (WeatherClient.connected()) { 
         line = WeatherClient.readStringUntil('\n');
    
    //Serial.println(line);
    Serial.println("parsingValues");

    //create a json buffer where to store the json data
    StaticJsonDocument<5000> doc;

    DeserializationError error = deserializeJson(doc,line); 
    
    //JsonObject root = doc.as<JsonObject>();
    //deserializeJson(doc, line);
    //auto error = deserializeJson(doc,line); 
    if (error){
      Serial.println("parseObject() failed");
    }
         else{Serial.println("success");}
    //Serial.println(line);
    String NowWeather =  doc["list"][0]["weather"][0]["main"]; 
    String NowTemp = doc["list"][0]["main"]["temp"];
    Serial.print(location);
    Serial.print("'s current weather is: ");
    Serial.println(NowWeather);
    Serial.print("Current tempreture is: ");
    Serial.println(NowTemp);


    if (NowWeather == "Clear"){
      digitalWrite(1,LOW);
      digitalWrite(2,LOW);
      digitalWrite(3,LOW);
      digitalWrite(4,LOW);
      digitalWrite(5,HIGH);
  Serial.println("Clear HIGH");
    }
    else if (NowWeather == "Clouds"){
      digitalWrite(1,LOW);
      digitalWrite(2,LOW);
      digitalWrite(3,LOW);
      digitalWrite(4,HIGH);
      digitalWrite(5,LOW);
  Serial.println("Clouds HIGH");
    }
else if (NowWeather == "Rain"){
      digitalWrite(1,LOW);
      digitalWrite(2,LOW);
      digitalWrite(3,HIGH);
      digitalWrite(4,LOW);
      digitalWrite(5,LOW);
  Serial.println("Rain HIGH");
    }
else {
      digitalWrite(1,HIGH);
      digitalWrite(2,LOW);
      digitalWrite(3,LOW);
      digitalWrite(4,LOW);
      digitalWrite(5,LOW);
  Serial.println("Rain HIGH");
    }
    delay(1000);
    continue;
    }
WeatherClient.stop();
    return;

   } 
