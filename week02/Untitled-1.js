//i is absolute mouse position from width/1982 to 991xwidth/1982, s is stored array from 10 ~ 1000

const posMX = new Map();

for (var i = width/1982,s=10; i<=width/2,s<=1000; i+=width/1982,s++)
{
    posMX.set(i,s);
}

const posMY = new Map();

for (var i = height/1982,s=10; i<=height/2,s<=1000; i+=height/1982,s++)
{
    posMY.set(i,s);
}