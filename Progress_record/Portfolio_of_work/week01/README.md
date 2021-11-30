# Background Story 
## Someday in the near future, when *Skrulls* infiltrated earth.

*Skrulls* is an alien species, much like the Skurll in Marvel's comic. They can transform into the shape of other beings, and gain their biometric information.

Humans need to find a new way of biometric encryption to stop *Skrulls* from picking any locks as easy as rolling a log.

*Luckily, when they are transformed, their body temperature is not changed, and remain a standard 15 degrees C.*

This is why a temperature-differences based lock is invented.

Only those who know the encryption rules, as well as the passcode, can open this.

## This is a prototype of a Temperature-difference based lock interface. 

1. The passcode you should have remembered is a 5-digits number array, formed only by numbers[0,1,2,3,4,5].

2. When the lock is initiated, a baseline temperature is stored using a temp sensor on 2nd breadboard(on left).

3. You should then manipulate with the sensor on the main breadboard(on right), and press the button when you reach the desired number.

 3.1. The sensor-read temperature will not be stored

 3.2. The temp difference between baseline temp and sensor temp will be stored upon a press of the button, and will be compiled into int from float with the following rules.  

    3.2.1. int passcode = (int) FloatingPasscode

 3.3. Each time the button is pressed, one digit of the passcode will be recorded.

4. After you entered your 5 digits passcode, the lock will open if the passcode is correct. (Not included in this design.)
 
5. All locks should have their baseline temperature over 20 degrees C, so that Skrulls cannot open locks with their bare hands.*(Watch carefully if your "human" friend try to use tools to warm their hands up!)*

# *Live with your Family, NOT a Skrumily!*
