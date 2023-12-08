let canvas;
let canvasContext;
const polygons = []

window.onload = function() {
	console.log("onloaded!");
	canvas = document.getElementById("myCanvas");
	canvasContext = canvas.getContext("2d");
	console.log(canvasContext)
	init();
	const FPS = 30;
	setInterval(() => {
		update();
	}, 1000/FPS);
}

function init() {
	polygons.push(new Polygon([[10,20],[10,-20],[-10,-20],[-10,20]], [50, 100], 0.1, "#ff0000"))
}

function update() {
	clearCanvas()
	polygons.forEach(p => p.draw());
	polygons.forEach(p => p.rotation += 0.1)
}

function clearCanvas() {
	canvasContext.fillStyle = "#000000";
	canvasContext.fillRect(0, 0, canvas.width, canvas.height);
}



class RigidObject {
	/**
     * someProperty is an example property that is set to `true`
     * @property {[number, number][]} shape
		 * @property {[number, number]} velocity	 
		 * @property {[number, number]} position
		 * rotation is an angle of rotation in radious
		 * @property {number} rotation
		 * @property {number} rotationalVelocity
		 * @property {string} color
     */
	shape
	velocity = [0, 0]
	position
	rotationalVelocity = 0
	rotation
	color
	/**
	 * @param {[number, number][]} shape 
	 * @param {[number, number]} position 
	 * @param {number} rotation 
	 * @param {string} color 
	 */
	constructor(shape, position, rotation, color) {
		this.shape = shape
		this.position = position
		this.rotation = rotation
		this.color = color
	}
}


class Polygon {
	/**
     * someProperty is an example property that is set to `true`
     * @property {[number, number][]} shape
		 * @property {[number, number]} position
		 * rotation is an angle of rotation in radious
		 * @property {number} rotation
		 * @property {string} color
     * @public
     */
	shape
	position
	rotation
	color
	/**
	 * @param {[number, number][]} shape 
	 * @param {[number, number]} position 
	 * @param {number} rotation 
	 * @param {string} color 
	 */
	constructor(shape, position, rotation, color) {
		this.shape = shape
		this.position = position
		this.rotation = rotation
		this.color = color
	}
	draw() {
		const sin = Math.sin(this.rotation);
		const cos = Math.cos(this.rotation);
		const globalVerticiesPositions = []
		for(let i = 0; i < this.shape.length; i++) {
			const x = this.shape[i][0]
			const y = this.shape[i][1]
			globalVerticiesPositions.push([
				this.position[0] + x*cos - y*sin,
				this.position[1] + x*sin + y*cos
			]) 
			this.drawPoly(globalVerticiesPositions)
		}
	}
	/**
	 * @param {[number,number][]} verticies 
	 */
	drawPoly(verticies) {
		canvasContext.fillStyle = this.color;
		canvasContext.beginPath();
		canvasContext.moveTo(verticies[0], verticies[1]);
		for (let i = 0 ; i < verticies.length ; i++) {
			canvasContext.lineTo(verticies[i][0], verticies[i][1]);
		}
		canvasContext.closePath();
		canvasContext.fill();
	}
}