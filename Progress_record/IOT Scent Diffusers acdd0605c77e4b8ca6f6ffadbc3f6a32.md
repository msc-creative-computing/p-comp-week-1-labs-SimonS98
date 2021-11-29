# IOT Scent Diffusers

by Sixiong (Simon) Sheng

This page is best viewed on a computer browser.

<aside>
💡  **Why this project

Fragrances**, **essential oil**, and different kinds of Aroma expanders are **important** in my daily life. 

My personal experience and many research has shown [**scents affect mood**](https://www.scientificamerican.com/article/do-scents-affect-peoples/), and ***[75%* of all emotions generated every day are due to smell**.](https://www.competitivechoice.net/Articles.asp?ID=343)  I enjoy **different smell** for different **use**, different **weather**, for waking up and go to sleep.  

While having different scents being so important, my room is often **stuck** with **one smell** in a period of time, because my dispenser can only contain one essential oil at a time, and it's **NOT** the easiest job to clean dispenser stones, or diffusers.

The only way to enjoy different smells in a same day is to buy **many** **different** dispenser stone/diffuser, etc.

There must be a better way...
**I'll make a diffuser for many scents...**

</aside>

![5-senses-infographic.png](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/5-senses-infographic.png)

![159946007234017500_a700xH.jpeg](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/159946007234017500_a700xH.jpeg)

![5055321374953_01_400.jpg](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/5055321374953_01_400.jpg)

<aside>
📌 **Problem Breakdown** (Click to jump)

**① [Making]()**
       🌬️    [Atomiser]()
       ****🌊    [Water Tank]()
       ****⚙️    [Soldering]()

**② [Coding]()**
       ⁉️   [Challenge #1(Wifi Connection)]()
****       ⁉️   [Challenge #2 (Arduino Json6)]()
****       ⁉️   [Challenge #3 (Build App)]()
****       ⁉️   [Challenge #4 (Rebuild Logic)]()

****🥳  **[The Fun Part (Hey, Siri!)]()**

</aside>

# Making

## 🌬️ Atomiser

First things first, I need atomisers to diffuse scented water. There aren't many options available, and I found these components for sale. This module is driven by a Micro USB and has a holding button. I need to bypass the Micro USB with cables, and solder the poles of buttons to turn it on with Arduino.

![O1CN01EFGe2A2AdYhLfaSjI_!!2081278226.png](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/O1CN01EFGe2A2AdYhLfaSjI_!!2081278226.png)

![IMG_6762.heic](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6762.heic)

After soldering, this module still can't simply be controlled by a digital pin, because it requires **5V2A**, which is over the maximum output of any Arduino board.

I therefore require a transistor and a compatible power resource.

![IRF520 transistor *MOSFET*](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6765.heic)

IRF520 transistor *MOSFET*

![9V2A in, 5V2A out, power module](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6764.heic)

9V2A in, 5V2A out, power module

and using the classic transistor MOSFET circuit.

![IMG_6622.HEIC](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6622.heic)

This is a mimic to the "Project 9, Motorised Pinwheel" of *Arduino Project Book,* I bypassed the button with a jump wire. I don't need an external input to keep the atomiser turned on.

## 🌊 Water Tank

To make sure one device can produce different scents, I need to either have different water tanks for different essential oil, or to have a shared tank for different oils. I came up with this idea as a simple mechanical solution, the holes for holding cotton stick are slightly smaller than stick itself, which makes oils harder to penetrate and mix with water.

![Bear with my sketch...](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_0316.jpg)

Bear with my sketch...

I prototyped for this idea, and it worked fine — not the best, but it works, which is enough.

![Thank you juice bottle.](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6632.jpg)

Thank you juice bottle.

![**Reverse the cap and here we go!**](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6636.heic)

**Reverse the cap and here we go!**

<aside>
💫 I've intentionally drilled the hole 1mm smaller than the high-density cotton stick, which prevented the oil mix with water for few hours of testing.

</aside>

<aside>
🧐 For better precision I would use a *peristaltic pump.* I managed to find one but it is too big for this project, consider I would need 5 of them.

</aside>

![IMG_6639.JPG](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6639.jpg)

![Too big for this project...](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6629.jpg)

Too big for this project...

Because I need a water tank, I couldn't use the popular LEGO modelling, I've turned to 3D modelling on Shapr3D, and SLA 3D printing with translucent resin.

[Thank you SketchFab for providing embed option. It's amazing.](https://sketchfab.com/models/833380de6ce545f68b389acc008ef740/embed)

Thank you SketchFab for providing embed option. It's amazing.

![It's desktop size, 120mm x 155mm x 40mm.](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/Drawing.jpg)

It's desktop size, 120mm x 155mm x 40mm.

<aside>
💫 It was then printed,  and all the dimensions are perfect.

</aside>

![Sticks are inserted separately. ](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6680.heic)

Sticks are inserted separately. 

![Diffusers are slid into slots and locked by cottons sticks.](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6766.heic)

Diffusers are slid into slots and locked by cottons sticks.

## ⚙️ Soldering

I have 5 modules, 5 transistors, 1 power supply and an Arduino MKR1000 to embed into a same system. I started by making everything on the breadboard, and then started soldering. I've also laser cut some acrylic board for circuit protection and appearance.

- Expand to view my soldering process:
    
    This was particularly fun yet exhausting, not to mention the dozens of parts I burnt...
    
    ![IMG_6687.HEIC](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6687.heic)
    
    ![IMG_6695.HEIC](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6695.heic)
    
    ![IMG_6706.JPG](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6706.jpg)
    
    ![IMG_6696.JPG](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6696.jpg)
    
    ![IMG_6731.HEIC](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6731.heic)
    
    ![IMG_6735.HEIC](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6735.heic)
    
    ![IMG_6740.HEIC](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6740.heic)
    

![I love the outcome, and I will work on my lining next time😂](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6753.jpg)

I love the outcome, and I will work on my lining next time😂

# Coding

## Challenge #1(Wifi Connection)

To make the diffuser change scent along with weather, the first thing is to make it knows the current weather. I had the option to use a WIFI module with Arduino UNO, or to use an Arduino MKR1000, which has a WIFI module embedded.

![MKR is much more compact in size. ](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6770.heic)

MKR is much more compact in size. 

MKR 1000 is not only more compact in size, it is also more suitable for physical hacking, as I can solder everything easier without jump wires.

```arduino
//I started testing WIFI connection with ver basic commands.

#include <SPI.h>
#include <WiFi101.h>
#include "arduino_secrets.h"

// I've discovered if you want to share something with a password you can put them in another tab.
char ssid[] = SECRET_SSID;      
char pass[] = SECRET_PSW;

int status = WL_IDLE_STATUS;

WiFiClient client;

void setup() {
  pinMode(5,OUTPUT);
  Serial.begin(9600);

  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    
    status = WiFi.begin(ssid, pass);
    
    // wait 5 seconds for connection:
    delay(5000);
  }
  Serial.println("Connected to wifi");
}

void loop(){
if(client.connected()){
digitalWrite(5,HIGH);}
}
```

![截屏2021-11-29 下午4.23.36.png](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/%E6%88%AA%E5%B1%8F2021-11-29_%E4%B8%8B%E5%8D%884.23.36.png)

<aside>
🧐 The WIFI didn't work with the correct codes. 
It really took me a while to find out I need to update WiFi Frimware, thank you reddit.

</aside>

![截屏2021-11-29 下午4.27.00.png](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/%E6%88%AA%E5%B1%8F2021-11-29_%E4%B8%8B%E5%8D%884.27.00.png)

## Challenge #2 (Arduino Json6)

Now, I need to use MKR1000 to request weather data from specific regions and turn them into input. I start with with finding this weather requesting tutorial on MKR1000 which was very helpful.

[Getting Weather Data](https://create.arduino.cc/projecthub/officine/getting-weather-data-655720)

<aside>
❗ However, this code is still using the old AdruinoJson 5, which is no longer supported by the current Arduino IDE. 

I wasn't able to run the program.

</aside>

```arduino
taticJsonBuffer is a class from ArduinoJson 5. Please see [https://arduinojson.org/upgrade](https://arduinojson.org/upgrade) to learn how to upgrade your program to ArduinoJson version 6
```

The problem really focused on these lines:

```arduino
while (client.connected()) {
line = client.readStringUntil('\n');
//Serial.println(line);
Serial.println("parsingValues");

//create a json buffer where to store the json data
StaticJsonBuffer<5000> jsonBuffer;

JsonObject& root = jsonBuffer.parseObject(line);
if (!root.success()) {
  Serial.println("parseObject() failed");
  return;
}
```

I have no experience with ArduinoJson before, and I had to learn everything from scratch and learn how to convert Json 5 to Json 6.

I managed to learn how to convert with the help of this source.

[Migrating from version 5 to 6](https://arduinojson.org/v6/doc/upgrade/)

It turned out ArduinoJson6 is much easier to use without the necessity of creating ***root.***

This is what I ended up with:

```arduino
String line = ""; 
 while (client.connected()) { 
    line = client.readStringUntil('\n');
    
    Serial.println("parsingValues");

    //create a json document where to store the json data
    StaticJsonDocument<5000> doc;

    DeserializationError error = deserializeJson(doc,line); 
    
    if (error){
      Serial.println("parseObject() failed");
    }
    else{
		Serial.println("success");}
    
		//Print results for test
    String NowWeather =  doc["list"][0]["weather"][0]["main"]; 
    String NowTemp = doc["list"][0]["main"]["temp"];
    Serial.print(location);
    Serial.print("'s current weather is: ");
    Serial.println(NowWeather);
    Serial.print("Current tempreture is: ");
    Serial.println(NowTemp);
    return;
   }
```

<aside>
🧐 I wasn't aware that having a while loop here is causing some troubles later on, but it works great so far

</aside>

I was then able to get a json document with:

```arduino
//This print out the entire data requested from OpenWeather.
Serial.println(line); 
```

- **Example Json data from Open Weather (Click to expand)**
    
    ```json
    {
        "cod": "200",
        "message": 0,
        "cnt": 3,
        "list": [
            {
                "dt": 1637431200,
                "main": {
                    "temp": 3.83,
                    "feels_like": 2.74,
                    "temp_min": 3.83,
                    "temp_max": 5.24,
                    "pressure": 1022,
                    "sea_level": 1022,
                    "grnd_level": 1016,
                    "humidity": 69,
                    "temp_kf": -1.41
                },
                "weather": [
                    {
                        "id": 804,
                        "main": "Clouds",
                        "description": "overcast clouds",
                        "icon": "04n"
                    }
                ],
                "clouds": {
                    "all": 87
                },
                "wind": {
                    "speed": 1.41,
                    "deg": 126,
                    "gust": 2.37
                },
                "visibility": 10000,
                "pop": 0.01,
                "sys": {
                    "pod": "n"
                },
                "dt_txt": "2021-11-20 18:00:00"
            },
            {
                "dt": 1637442000,
                "main": {
                    "temp": 4.02,
                    "feels_like": 4.02,
                    "temp_min": 4.02,
                    "temp_max": 4.4,
                    "pressure": 1022,
                    "sea_level": 1022,
                    "grnd_level": 1015,
                    "humidity": 73,
                    "temp_kf": -0.38
                },
                "weather": [
                    {
                        "id": 803,
                        "main": "Clouds",
                        "description": "broken clouds",
                        "icon": "04n"
                    }
                ],
                "clouds": {
                    "all": 72
                },
                "wind": {
                    "speed": 0.7,
                    "deg": 132,
                    "gust": 1.21
                },
                "visibility": 10000,
                "pop": 0,
                "sys": {
                    "pod": "n"
                },
                "dt_txt": "2021-11-20 21:00:00"
            },
            {
                "dt": 1637452800,
                "main": {
                    "temp": 4.92,
                    "feels_like": 2.98,
                    "temp_min": 4.92,
                    "temp_max": 5.46,
                    "pressure": 1022,
                    "sea_level": 1022,
                    "grnd_level": 1016,
                    "humidity": 63,
                    "temp_kf": -0.54
                },
                "weather": [
                    {
                        "id": 803,
                        "main": "Clouds",
                        "description": "broken clouds",
                        "icon": "04d"
                    }
                ],
                "clouds": {
                    "all": 53
                },
                "wind": {
                    "speed": 2.3,
                    "deg": 293,
                    "gust": 7.13
                },
                "visibility": 10000,
                "pop": 0.02,
                "sys": {
                    "pod": "d"
                },
                "dt_txt": "2021-11-21 00:00:00"
            }
        ],
        "city": {
            "id": 1816670,
            "name": "Beijing",
            "coord": {
                "lat": 39.9075,
                "lon": 116.3972
            },
            "country": "CN",
            "population": 1000000,
            "timezone": 28800,
            "sunrise": 1637449560,
            "sunset": 1637484887
        }
    }
    ```
    

I can get various data, and I'm choosing the factors that really have impact on people's emotion.

Now I can get the datas with Arduino and pass it to the signal control program.

## Challenge #3 (Build App)

I do not have physical UI on the product, and I will need an App to drive it.

The first thing is I need the MKR connect to my local server and read commands from local IP.

I managed to find a tutorial here:

[How to Build an Android App to Control Your WiFi Enabled Arduino](https://www.youtube.com/watch?v=ZH7ufemP8e0)

Thank you [ForceTronics](https://www.youtube.com/channel/UCNd_fNspAczm8UoE2ay7K1Q). This a a great tutorial.

This tutorial taught me exactly how to connect MKR with local WiFi network, most importantly it introduced [http://appinventor.mit.edu/](http://appinventor.mit.edu/) to me.

[MIT App Inventor | Explore MIT App Inventor](http://appinventor.mit.edu/)

The mechanic is simple, after connected to local server, MKR will read the dedicated URL I access  from any web browser within same WiFi, and read how the line end with.

```arduino
#include <ArduinoJson.h> 
#include <SPI.h> 
#include <WiFi101.h> 
#include "arduino_secrets.h"

......

WiFiServer server(80);

......

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
						//print response if connected and receiving data.
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
				
				//Naming 5 atomisers status with H5/4/3/2/1, and L5/4/3/2/1.
        if (currentLine.endsWith("GET /H5")) {
          digitalWrite(5, HIGH);
					//Print current device status with user-friendly response.
          client.println("Your Fragrance for a Clear day is On.");
          delay(500); 
        }
        if (currentLine.endsWith("GET /L5")) {
          digitalWrite(5, LOW);
					//Print current device status with user-friendly response.
          client.print("Your Fragrance for a Clear day is Off.");
          delay(500); 
        }

......
				
				//Provide option to turn on all and turn off all
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
				//This is where user can turn on Auto Weather.
        if (currentLine.endsWith("GET /WeatherOn")) {
          client.println("Turning on Weather Mode.");
          getWeather(); 
          delay(500);
        }
```

I then explored the MIT App inventor, it's easy to operate.

![Simple GUI, but works well.](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/%E6%88%AA%E5%B1%8F2021-11-29_%E4%B8%8B%E5%8D%885.11.29.png)

Simple GUI, but works well.

![Simple logic, works great with Arduino.](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/%E6%88%AA%E5%B1%8F2021-11-29_%E4%B8%8B%E5%8D%885.12.21.png)

Simple logic, works great with Arduino.

And this is what I ended up with:

[If you can't watch the video — it works great, no perceivable delay.](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6699.mov)

If you can't watch the video — it works great, no perceivable delay.

![Screenshot from video.](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/IMG_6754.jpg)

Screenshot from video.

I'm almost ready.

## Challenge #4 (Rebuild Logic)

I now knows how to make MKR connect to local server, and to OpenWeather server, but there was a issue that once I connect to OpenWeather Server, I can no longer break the loop.

```arduino
while (WeatherClient.connected()) {
}
```

I need to stop this Weather client once  I have the data I need, and once I want to control it manually. 

I only knew how to use :

 

```arduino
break;
```

which doesn't work because I need it to continue but not return to previous action. I then discovered:

```arduino
continue;
//I'm thankful for this being so straight forward...
```

So now I have the code continues after detecting the weather.

After that I can request the connection to WeatherClient stop.

```arduino
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
```

Sometimes the getWeather() function reruns without commands, so I added *continue* here and solved the problem.

```arduino
if (currentLine.endsWith("GET /WeatherOn")) {
          client.println("Turning on Weather Mode.");
          getWeather(); 
          delay(500);
          continue;
        }
```

To this step, I've finally completed all the essentials and everything works as I expected.

You can check the entire code here:

- Full_Code_IOT_Fragrance_Sixiong_Sheng
    
    ```arduino
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
    ```
    

Or check it out on github:

[p-comp-week-1-labs-SimonS98/IOT_Fragrance_Sixiong_Sheng.ino at main · msc-creative-computing/p-comp-week-1-labs-SimonS98](https://github.com/msc-creative-computing/p-comp-week-1-labs-SimonS98/blob/main/Progress_record/IOT_Fragrance_Sixiong_Sheng.ino)

## 🥳 The Fun Part  (Hey, Siri!)

Hmmm, if I can controll it simply with a browser, and I can use siri to access a browser, then...

**Must Watch!**

[20211129_182317.mp4](IOT%20Scent%20Diffusers%20acdd0605c77e4b8ca6f6ffadbc3f6a32/20211129_182317.mp4)

Yes, it also use you browser as a external display to update your the current status of the diffuser!

---

Many thanks to Phoenix Perry, Matt Jarvis, and Mahalia Henry-Richards for their guidance and technical support throughout this project. Thanks to Creative Computing Institute for having this course. I must also thanks my friends and collegues who spent their valuable time for discussions and helpful advices.  Huge appreciation to **[Officine Innesto](https://create.arduino.cc/projecthub/officine), [Benoit Blanchon](https://www.youtube.com/channel/UC8HZRqN4wfytHfRGMLUQWkQ), [ForceTronics](https://www.youtube.com/channel/UCNd_fNspAczm8UoE2ay7K1Q),** and **[MIT APP INVENTOR](https://appinventor.mit.edu)** for the amazing contents they created which allowed me to build everything from scratch. I've truly explored the fun of physical computing through this project!