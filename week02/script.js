var changehis = 1;
var maxim = maximilian();
var maxiAudio = new maxim.maxiAudio();


//osc setting
var osc1 = new maxim.maxiOsc();
var osc2 = new maxim.maxiOsc();
var osc3 = new maxim.maxiOsc();
var osc4 = new maxim.maxiOsc();
var osc5 = new maxim.maxiOsc();

//drawoutput setting
var drawOutput1 = new Array(1024);
var drawOutput2 = new Array(1024);
var counter = 0;


//canvas setting
var canvas = document.querySelector("canvas");
var width = window.innerWidth;
var height = window.innerHeight;
var context = canvas.getContext("2d");
canvas.setAttribute("width", width);
canvas.setAttribute("height", height);

//buffer
var bufferfreq = 44100/1024;


//Osc visualisation
let playAudio = () => {
    maxiAudio.init();

    maxiAudio.play = function(){
    var wave=

    var wave2=

    drawOutput1[counter % 1024] = wave;
    drawOutput2[counter % 1024] = wave2;
    return wave * 0.0;
    }
}



//set mid point
var posbaseX = width/2;
var posbaseY = height/2;

//draw
function draw(){
    context.clearRect(0, 0, width, height);

    var spacing = ((Math.PI * 2) / 1024 );

    //set size
    var size = 

    for(var i = 0; i<1024; i++){
        //defineX&Y
     posX = posbaseX + Math.cos( i * spacing ) * size * 2 *drawOutput2[i];
     posY = posbaseY + Math.sin( i * spacing ) * size * 2 * drawOutput2[i];

     //start drawing
     context.beginPath();
     context.moveTo(positionBaseX + (Math.cos(i * spacing) * size * drawOutput1[i]),posbaseY + (Math.sin(i * spacing) * size * drawOutput1[i])        );
     context.lineTo(posX,posY);

     //setstyle
     //context.strokeStyle();
     context.stroke();
    }
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);