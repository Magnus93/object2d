import {Draw} from "./Draw"
import { Settings } from "./Settings"
import {state} from "./State"


export class ColideDetector {
	static relationships: [{rigid: Rigid, maxVertDistanceSquared: number}, {rigid: Rigid, maxVertDistanceSquared: number}][] = []
	static addRigit(rigid: Rigid) {
		state.rigids.forEach(r => {
			this.relationships.push([
				{ rigid: r, maxVertDistanceSquared: this.calcMaxVertDistanceSquared(r) },
				{ rigid, maxVertDistanceSquared: this.calcMaxVertDistanceSquared(rigid) }
			])
		})
		state.rigids.push(rigid)
	}
	
	static calcMaxVertDistanceSquared(rigid: Rigid) {
		return Math.max(...rigid.spacial.shape.map(point => point[0] * point[0] + point[1] * point[1]))
	}
	static detectColisions() {
		this.relationships.forEach(ColideDetector.detectColision)
	}
	static detectColision(relationship: [{rigid: Rigid, maxVertDistanceSquared: number}, {rigid: Rigid, maxVertDistanceSquared: number}]) {
		if (ColideDetector.closeEnough(relationship)) {
			const verticies1 = relationship[0].rigid.polygon.spacial.getGlobalVertPositions()
			const lines1 = ColideDetector.verticiesToLinesSegments(verticies1)
			const verticies2 = relationship[1].rigid.polygon.spacial.getGlobalVertPositions()
			const lines2 = ColideDetector.verticiesToLinesSegments(verticies2)
			const intersection = ColideDetector.intersect(lines1, lines2)
			if (intersection) {
				Draw.marking(intersection, "#ffffff")
			}
		}
	}

	static intersect(lines1: [[number, number],[number, number]][], lines2: [[number, number],[number, number]][]): [number, number] | false {
		for(const line1 of lines1) {
			for(const line2 of lines2) {
				const intersection = ColideDetector.linesIntersect(line1, line2)
				if(intersection)
					return intersection
			}
		}
		return false
	}
	static closeEnough(relationship: [{rigid: Rigid, maxVertDistanceSquared: number}, {rigid: Rigid, maxVertDistanceSquared: number}]) {
		const pos1 = relationship[0].rigid.spacial.position
		const pos2 = relationship[1].rigid.spacial.position
		const xDist = pos1[0] - pos2[0]
		const yDist = pos1[1] - pos2[1]
		const squareDistance = xDist*xDist + yDist*yDist
		return squareDistance < relationship[0].maxVertDistanceSquared + relationship[1].maxVertDistanceSquared
	}
	static linesIntersect(line1: [[number, number],[number, number]], line2: [[number, number],[number, number]]) {
		const intersectPoint = this.findIntersection(line1, line2)
		return (
			ColideDetector.pointWithinLineSegment(intersectPoint, line1) && 
			ColideDetector.pointWithinLineSegment(intersectPoint, line2)
		) 
		? intersectPoint 
		: false
	}
	static verticiesToLinesSegments(vertecies: [number, number][]): [[number, number],[number, number]][] {
		const lines: [[number, number],[number, number]][] = []
		for(let i = 0; i < vertecies.length - 1; i++) {
			lines.push([vertecies[i], vertecies[i+1]])
		}
		return lines
	}
	static findIntersection(line1: [[number, number],[number, number]], line2: [[number, number],[number, number]]): [number, number] {
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

	static pointWithinLineSegment(point: [number, number], lineSegment: [[number, number], [number, number]]) {
		const minX = Math.min(lineSegment[0][0], lineSegment[1][0])
		const maxX = Math.max(lineSegment[0][0], lineSegment[1][0])
		const minY = Math.min(lineSegment[0][1], lineSegment[1][1])
		const maxY = Math.max(lineSegment[0][1], lineSegment[1][1])
		return minX <= point[0] && point[0] <= maxX && minY <= point[1] && point[1] <= maxY
	}

}


export class Rigid {
	velocity: [number, number] = [0, 0]
	rotationalVelocity = 0
	spacial: Spacial
	polygon: Polygon

	constructor(shape: [number, number][], position: [number, number], rotation: number, color: string) {
		this.spacial = new Spacial(shape, position, rotation)
		this.polygon = new Polygon(this.spacial, color)
		ColideDetector.addRigit(this)
	}
	update() {
		this.spacial.position[0] += this.velocity[0] * Settings.dt
		this.spacial.position[1] += this.velocity[1] * Settings.dt
		this.spacial.rotation += this.rotationalVelocity * Settings.dt
		this.polygon.draw()
	}
}

class Polygon {
	spacial: Spacial
	color: string
	constructor(spacial: Spacial, color: string) {
		this.spacial = spacial
		this.color = color
	}
	draw() {
		const globalVerticiesPositions = this.spacial.getGlobalVertPositions()
		Draw.poly(globalVerticiesPositions, this.color)
	}
}

class Spacial {
	shape: [number, number][]
	position: [number, number]
	rotation: number
	constructor(shape: [number, number][], position: [number, number], rotation: number) {
		this.shape = shape
		this.position = position
		this.rotation = rotation
	}
	getGlobalVertPositions(): [number, number][] {
		const sin = Math.sin(this.rotation);
		const cos = Math.cos(this.rotation);
		const globalVerticiesPositions: [number, number][] = []
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