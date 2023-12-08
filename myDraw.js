

function drawPoly(polyList, color) {
	canvasContext.fillStyle = "red";
	canvasContext.beginPath();

	canvasContext.moveTo(polyList[0], polyList[1]);
	for (var vert = 2 ; vert<polyList.length-1 ; vert+=2) {
		canvasContext.lineTo(polyList[vert], polyList[vert+1]);
	}
	canvasContext.closePath();
	canvasContext.fill();
}