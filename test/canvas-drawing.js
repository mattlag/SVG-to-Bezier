export function drawBeziersToCanvas(bezierPaths, ctx) {
	// console.log(`drawBeziersToCanvas`);
	// console.log(bezierPaths);
	ctx.lineWidth = 1;
	bezierPaths.forEach((path) => {
		const pathAccentColor = `hsl(${Math.floor(Math.random() * 360)}, 80%, 40%)`;
		ctx.font = "8px Verdana";
		ctx.beginPath();
		ctx.moveTo(path[0][0].x, path[0][0].y);
		path.forEach((curve) => {
			console.log(`Drawing curve: ${JSON.stringify(curve)}`);
			let p0 = curve[0];
			let p1 = false;
			let p2 = false;
			let p3 = curve[3];
			// ctx.moveTo(p0.x, p0.y);
			if (curve[1] === false && curve[2] === false) {
				// straight line
				ctx.lineTo(p3.x, p3.y);
			} else {
				// curve
				p1 = curve[1] ? curve[1] : curve[0];
				p2 = curve[2] ? curve[2] : curve[3];
				ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
			}
			drawPoint(p0, ctx, pathAccentColor);
			if (curve[1] !== false) drawHandle(p1, ctx, pathAccentColor);
			if (curve[2] !== false) drawHandle(p2, ctx, pathAccentColor);
			drawPoint(p3, ctx, pathAccentColor);
		});
		ctx.strokeStyle = pathAccentColor;
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
		ctx.fill();
	});
}

function drawPoint(point, ctx, accent) {
	ctx.save();
	ctx.fillStyle = accent;
	// ctx.fillText(`${point.x}, ${point.y}`, point.x - 2, point.y - 4);
	ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
	ctx.restore();
}

function drawHandle(point, ctx, accent) {
	ctx.save();
	ctx.strokeStyle = accent;
	ctx.strokeRect(point.x - 2, point.y - 2, 4, 4);
	ctx.restore();
}
