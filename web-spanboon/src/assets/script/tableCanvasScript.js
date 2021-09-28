var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");


console.log('height;', $(document).height());
console.log('width;', $(document).width());

ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();