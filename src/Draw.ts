
export namespace Draw {
	export const canvas: {
		element?: HTMLCanvasElement,
		context?: CanvasRenderingContext2D,
	} = {}

	export function poly(verticies: [number, number][], color: string) {
		canvas.context && (canvas.context.fillStyle = color)
		canvas.context?.beginPath()
		canvas.context?.moveTo(verticies[0][0], verticies[0][1]);
		for (let i = 0; i < verticies.length; i++) {
			canvas?.context?.lineTo(verticies[i][0], verticies[i][1]);
		}
		canvas.context?.closePath();
		canvas.context?.fill();
	}
	export function marking(point: [number, number], color: string) {
		canvas.context?.beginPath();
		canvas.context?.arc(point[0], point[1], 5, 0, 2*Math.PI);
		canvas.context && (canvas.context.fillStyle = color);
		canvas.context?.fill();
	}
	export function clear(color = "#000000") {
		if (canvas.context && canvas.element){
			canvas.context.fillStyle = color
			canvas?.context?.fillRect(0, 0, canvas.element.width, canvas.element.height)
		}
	}
}
