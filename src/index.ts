import {Draw} from "./Draw"
import {state} from "./State"
import {ColideDetector, Rigid} from "./Rigid"
import { Settings } from "./Settings";


window.onload = function () {
	console.log("onloaded!");
	Draw.canvas.element = document.getElementById("myCanvas") as HTMLCanvasElement;
	Draw.canvas.context = Draw.canvas.element.getContext("2d") ?? Draw.canvas.context;
	console.log(Draw.canvas.context)
	init();
	setInterval(() => {
		update();
	}, Settings.dt);
}

function init() {
	const rectangleShape: [number, number][] = [[10, 20], [10, -20], [-10, -20], [-10, 20]]
	const rigids1 = new Rigid(rectangleShape, [80, 120], 0.1, "#ff3333")
	rigids1.velocity = [0.05, 0.025]
	rigids1.rotationalVelocity = 0.0002
	new Rigid(rectangleShape, [400, 300], 0.1, "#33ff33")

}

function update() {
	Draw.clear()
	state.rigids.forEach(r => r.update())
	ColideDetector.detectColisions()	
}
