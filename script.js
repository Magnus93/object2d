let canvas;
let canvasContext;
const rigids = []
const FPS = 30;
const dt = 1000/FPS;

window.onload = function() {
	console.log("onloaded!");
	canvas = document.getElementById("myCanvas");
	canvasContext = canvas.getContext("2d");
	console.log(canvasContext)
	init();
	setInterval(() => {
		update();
	}, dt);
}

function init() {
	const rectangleShape = [[10,20],[10,-20],[-10,-20],[-10,20]]
	const rigids1 = new RigidObject(rectangleShape, [80, 120], 0.1, "#ff3333")
	rigids1.velocity = [0.05, 0.025]
	rigids1.rotationalVelocity = 0.0002
	new RigidObject(rectangleShape, [400, 300], 0.1, "#33ff33")
	
}

function update() {
	clearCanvas()
	rigids.forEach(r => r.update())
}

function clearCanvas() {
	canvasContext.fillStyle = "#000000";
	canvasContext.fillRect(0, 0, canvas.width, canvas.height);
}



class RigidObject {
	/**
     * @property {Spacial} spacial
		 * @property {[number, number]} velocity
		 * rotation is an angle of rotation in radious
		 * @property {number} rotationalVelocity
		 * @property {Polygon} polygon
     */
		velocity = [0, 0]
		rotationalVelocity = 0
		spacial
		polygon

	/**
	 * @param {[number, number][]} shape
	 * @param {[number, number]} position
	 * @param {number} rotation
	 * @param {string} color
	 */
	constructor(shape, position, rotation, color) {
		this.spacial = new Spacial(shape, position, rotation)
		this.polygon = new Polygon(this.spacial, color)
		rigids.push(this)
	}
	update() {
		this.spacial.position[0] += this.velocity[0] * dt
		this.spacial.position[1] += this.velocity[1] * dt
		this.spacial.rotation += this.rotationalVelocity * dt
		this.polygon.draw()
	}
}


class Polygon {
	/**
     * someProperty is an example property that is set to `true`
		 * @property {Spacial} spacial
		 * @property {string} color
     * @public
     */
	spacial
	color
	/**
	 * @param {Spacial} spacial
	 * @param {string} color 
	 */
	constructor(spacial, color) {
		this.spacial = spacial
		this.color = color
	}
	draw() {
		const sin = Math.sin(this.spacial.rotation);
		const cos = Math.cos(this.spacial.rotation);
		const globalVerticiesPositions = []
		for(let i = 0; i < this.spacial.shape.length; i++) {
			const x = this.spacial.shape[i][0]
			const y = this.spacial.shape[i][1]
			globalVerticiesPositions.push([
				this.spacial.position[0] + x*cos - y*sin,
				this.spacial.position[1] + x*sin + y*cos
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

class Spacial {
	/**
     * @property {[number, number][]} shape
		 * @property {[number, number]} position
		 * rotation is an angle of rotation in radious
		 * @property {number} rotation
     */
		shape
		position
		rotation
			/**
	 * @param {[number, number][]} shape
	 * @param {[number, number]} position
	 * @param {number} rotation
	 */
	constructor(shape, position, rotation) {
		this.shape = shape
		this.position = position
		this.rotation = rotation
	}

}