var canvas;
var canvasContext;
var myRocket;
var gravity = 0.1;
var keysDown = {};
var bgColor = "#000045";
var coliders = [];

//##################################
//####		rocket logic 		####
//##################################

function reset() {
	myRocket.reset();
}


class colider {
	constructor(posX, posY, width, height, deadly) {
		this.posX = posX;
		this.posY = posY;
		this.width = width;
		this.height = height;
		this.deadly = deadly;
		if (deadly) {this.color = 'orange';}
		else {this.color = 'white';}
		coliders.push(this);
	}

	draw() {
		drawRect(this.posX, this.posY, this.width, this.height, this.color);
	}
}

class rocket {
	constructor(posX, posY, speedX, speedY, color) {
		this.posX = posX;
		this.startX = posX;
		this.posY = posY;
		this.startY = posY;
		this.speedRot = 0;
		this.rot = 0;
		this.speedX = speedX;
		this.speedY = speedY;
		this.color = color;
		this.isBoosted = false;
		this.thrust = 0.3;
		this.rotThrust = 0.007;
		this.shape = [0, -20, -15, 20, 15, 20];
		this.dying = false;
		this.dyingCounter = 0;
	}

	update() {
		if (this.isBoosted) {
			this.boost();
		}
		this.detectColisions();
		if (this.dying) {
			this.die();
		} else {
			this.controll();
			this.speedY += gravity;
			this.posX += this.speedX;
			this.posY += this.speedY;
			this.rot += this.speedRot;
		}
	}

	die() {
		var deathColors = ['red', 'orange', 'white'];
		var colorIndex = Math.floor(Math.random()*3);
		if (this.dyingCounter < 20) {
			this.dyingCounter++;
			console.log(this.dying);
			drawCircle(this.posX-10+Math.random()*20,
				this.posY-10+Math.random()*20,
				Math.random()*30,
				deathColors[colorIndex]);
			console.log(typeof(colorIndex), colorIndex);
		} else {
			reset();
		}
	}

	reset() {
		this.posX = this.startX;
		this.posY = this.startY;
		this.speedX = 0;
		this.speedY = 0;
		this.speedRot = 0;
		this.rot = 0;
		this.dying = false;
		this.dyingCounter = 0;
	}

	detectColisions() {
		for (var i in coliders) {
			var col = coliders[i];
			if (col.deadly && this.detectColide(col)) {
				this.dying = true;
			}
		}
	}

	detectColide(col) {
		if (col.posX < this.posX && this.posX <col.posX+col.width) {
			if (col.posY < this.posY && this.posY <col.posY+col.height) {
				return true;
			}
		}
		return false;
	}

	draw() {
		// Draw boost
		if (this.isBoosted) {
			drawRotPoly([0,15,-10,30,10,30], "red", this.rot, this.posX, this.posY);
		}

		// Draw ship
		drawRotPoly(this.shape, this.color, this.rot, this.posX, this.posY);
	}



	boost() {
		this.speedX += this.thrust*Math.sin(this.rot);
		this.speedY -= this.thrust*Math.cos(this.rot);
	}

	controll() {
		if (keysDown[38]) {				// [Up]
			this.isBoosted = true;
		} else if (this.isBoosted) {
			this.isBoosted = false;
		}
		if (keysDown[39]) {this.speedRot += this.rotThrust;}	// [Right]
		if (keysDown[37]) {this.speedRot -= this.rotThrust;}	// [Left]
		if (keysDown[82]) {reset();}		// [r]
	}
}


//##################################
//####		run function 		####
//##################################


window.onload = function() {
	console.log("onloaded!");
	canvas = document.getElementById("myCanvas");
	canvasContext = canvas.getContext("2d");
	init();
	var FPS = 30;
	setInterval(function () {
		update();
		draw();
	}, 1000/FPS);
}

function init() {
	myRocket = new rocket(350,50, 0.2 ,0.2 , "green");
	new colider(40, 500, 50, 50, true);
	new colider(500, 40, 40, 40, true);
	new colider(700, 400, 80, 20, true);
	new colider(240, 250, 80, 20, true);
	new colider(340, 500, 40, 40, true);
	new colider(-10, -10, 980, 20, true); // Top wall
	new colider(-10, 590, 980, 20, true); // Lower wall
	new colider(-10, -10, 20, 620, true); // Left wall
	new colider(950, -10, 20, 620, true); // Right wall
	console.log("Initialized myRocket, Color: " + myRocket.color);
	clearCanvas();
}


function update() {
	clearCanvas();
	myRocket.update();
	for(i in coliders) {
		var col = coliders[i];
		col.draw();
	}
}

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

function draw() {
	myRocket.draw();
}
function clearCanvas() {
	drawRect(0, 0, canvas.width, canvas.height, bgColor);
}

//##################################
//####	transform function 		####
//##################################

function rotate(xPivot, yPivot, xPoint, yPoint, angle) {
	var sin = Math.sin(rot);
	var cos = Math.cos(rot);
	newX = xPivot + x*cos - y*sin;
	newY = yPivot + x*sin + y*cos;
	return [newX, newY];
}

//##################################
//####		draw function 		####
//##################################


function drawRotPoly(polyList, color, rot, xPivot, yPivot) {
	var sin = Math.sin(rot);
	var cos = Math.cos(rot);
	var rot_shape = [];
	for(var i=0 ; i<polyList.length; i=i+2) {
		var x = polyList[i];
		var y = polyList[i+1];
		rot_shape.push(xPivot + x*cos - y*sin);
		rot_shape.push(yPivot + x*sin + y*cos);
	}
	drawPoly(rot_shape, color);
}

function drawPoly(polyList, color) {
	canvasContext.fillStyle = color;
	canvasContext.beginPath();

	canvasContext.moveTo(polyList[0], polyList[1]);
	for (var vert = 2 ; vert<polyList.length-1 ; vert+=2) {
		canvasContext.lineTo(polyList[vert], polyList[vert+1]);
	}
	canvasContext.closePath();
	canvasContext.fill();
}


function drawRect(x, y, w, h, color) {
	canvasContext.fillStyle = color;
	canvasContext.fillRect(x,y,w,h);
}

function drawCircle(x, y, r, color) {
	canvasContext.beginPath();
	canvasContext.arc(x, y, r, 0, 2*Math.PI);
	canvasContext.fillStyle = color;
	canvasContext.fill();
}
