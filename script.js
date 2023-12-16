let canvas;
let canvasContext;
const rigids = []
const FPS = 30;
const dt = 1000 / FPS;

window.onload = function () {
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
	const rectangleShape = [[10, 20], [10, -20], [-10, -20], [-10, 20]]
	const rigids1 = new Rigid(rectangleShape, [80, 120], 0.1, "#ff3333")
	rigids1.velocity = [0.05, 0.025]
	rigids1.rotationalVelocity = 0.0002
	new Rigid(rectangleShape, [400, 300], 0.1, "#33ff33")

}

function update() {
	clearCanvas()
	rigids.forEach(r => r.update())
	ColideDetector.detectColisions()	
}

function clearCanvas() {
	canvasContext.fillStyle = "#000000";
	canvasContext.fillRect(0, 0, canvas.width, canvas.height);
}

class ColideDetector {
	/**
	 * @property {[{rigid: Rigid, maxVertDistanceSquared: number}, {rigid: Rigid, maxVertDistanceSquared: number}][]} relationships
	 */
	static relationships = []
	static addRigit(rigid) {
		rigids.forEach(r => {
			this.relationships.push([
				{ rigid: r, maxVertDistanceSquared: this.calcMaxVertDistanceSquared(r) },
				{ rigid, maxVertDistanceSquared: this.calcMaxVertDistanceSquared(rigid) }
			])
		})
		rigids.push(rigid)
	}
	/**
	 * 
	 * @param {Rigid} rigid 
	 */
	static calcMaxVertDistanceSquared(rigid) {
		return Math.max(...rigid.spacial.shape.map(point => point[0] * point[0] + point[1] * point[1]))
	}
	static detectColisions() {
		this.relationships.forEach(ColideDetector.detectColision)
	}
	/**
	 * 
	 * @param {[{rigid: Rigid, maxVertDistanceSquared: number}, {rigid: Rigid, maxVertDistanceSquared: number}]} relationship 
	 */
	static detectColision(relationship) {
		if (ColideDetector.closeEnough(relationship)) {
			const verticies1 = relationship[0].rigid.polygon.spacial.getGlobalVertPositions()
			const lines1 = ColideDetector.verticiesToLinesSegments(verticies1)
			const verticies2 = relationship[1].rigid.polygon.spacial.getGlobalVertPositions()
			const lines2 = ColideDetector.verticiesToLinesSegments(verticies2)
			const intersection = ColideDetector.intersect(lines1, lines2)
			if (intersection) {
				drawMarking(intersection, "#ffffff")
			}
		}
	}
	/**
	 * 
	 * @param {[[number, number],[number, number]][]} lines1 
	 * @param {[[number, number],[number, number]][]} lines2 
	 * @returns {[number, number] | false}
	 */
	static intersect(lines1, lines2) {
		for(const line1 of lines1) {
			for(const line2 of lines2) {
				const intersection = ColideDetector.linesIntersect(line1, line2)
				if(intersection)
					return intersection
			}
		}
	}
	static closeEnough(relationship) {
		const pos1 = relationship[0].rigid.spacial.position
		const pos2 = relationship[1].rigid.spacial.position
		const xDist = pos1[0] - pos2[0]
		const yDist = pos1[1] - pos2[1]
		const squareDistance = xDist*xDist + yDist*yDist
		return squareDistance < relationship[0].maxVertDistanceSquared + relationship[1].maxVertDistanceSquared
	}
	/**
	 * 
	 * @param {[[number, number],[number, number]]} line1 
	 * @param {[[number, number],[number, number]]} line2 
	 * @returns {[number, number] | false}
	 */
	static linesIntersect(line1, line2) {
		const intersectPoint = this.findIntersection(line1, line2)
		return (
			ColideDetector.pointWithinLineSegment(intersectPoint, line1) && 
			ColideDetector.pointWithinLineSegment(intersectPoint, line2)
		) 
		? intersectPoint 
		: false
	}
	/**
	 * @param {[number, number][]} vertecies 
	 * @returns {[[number, number],[number, number]][]}
	 */
	static verticiesToLinesSegments(vertecies) {
		const lines = []
		for(let i = 0; i < vertecies.length - 1; i++) {
			lines.push([vertecies[i], vertecies[i+1]])
		}
		return lines
	}
	/**
	 * @param {[[number, number],[number, number]]} line1 
	 * @param {[[number, number],[number, number]]} line2 
	 * @returns {[number, number]}
	 */
	static findIntersection(line1, line2) {
		const xLength1 = line1[1][0] - line1[0][0]
		const yLength1 = line1[1][1] - line1[0][1]
		const deriv1 = yLength1 / xLength1
		const y1at0 = line1[0][1] - deriv1 * line1[0][0]

		const xLength2 = line2[1][0] - line2[0][0]
		const yLength2 = line2[1][1] - line2[0][1]
		const deriv2 = yLength2 / xLength2
		const y2at0 = line2[0][1] - deriv2 * line2[0][0]

		const intersectX = (y2at0 - y1at0) / (deriv1 - deriv2)
		const intersectY = deriv1 * intersectX + y1at0
		return [intersectX, intersectY]
	}

	/**
	 * 
	 * @param {[number, number]} point 
	 * @param {[[number, number], [number, number]]} lineSegment 
	 */
	static pointWithinLineSegment(point, lineSegment) {
		const minX = Math.min(lineSegment[0][0], lineSegment[1][0])
		const maxX = Math.max(lineSegment[0][0], lineSegment[1][0])
		const minY = Math.min(lineSegment[0][1], lineSegment[1][1])
		const maxY = Math.max(lineSegment[0][1], lineSegment[1][1])
		return minX <= point[0] && point[0] <= maxX && minY <= point[1] && point[1] <= maxY
	}

}


class Rigid {
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
		ColideDetector.addRigit(this)
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
		const globalVerticiesPositions = this.spacial.getGlobalVertPositions()
		this.drawPoly(globalVerticiesPositions)
	}
	/**
	 * @param {[number,number][]} verticies 
	 */
	drawPoly(verticies) {
		canvasContext.fillStyle = this.color;
		canvasContext.beginPath();
		canvasContext.moveTo(verticies[0], verticies[1]);
		for (let i = 0; i < verticies.length; i++) {
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
	/**
	 * @returns {[number, number][]}
	 */
	getGlobalVertPositions() {
		const sin = Math.sin(this.rotation);
		const cos = Math.cos(this.rotation);
		const globalVerticiesPositions = []
		for (let i = 0; i < this.shape.length; i++) {
			const x = this.shape[i][0]
			const y = this.shape[i][1]
			globalVerticiesPositions.push([
				this.position[0] + x * cos - y * sin,
				this.position[1] + x * sin + y * cos
			])
		}
		return globalVerticiesPositions
	}
}

/**
 * 
 * @param {[number,number]} point 
 */
function drawMarking(point, color) {
	canvasContext.beginPath();
	canvasContext.arc(point[0], point[1], 5, 0, 2*Math.PI);
	canvasContext.fillStyle = color;
	canvasContext.fill();
}