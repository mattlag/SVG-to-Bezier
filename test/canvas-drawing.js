export function drawBeziersToCanvas(bezierPaths, ctx) {
	// console.log(`drawBeziersToCanvas`);
	// console.log(bezierPaths);
	ctx.lineWidth = 1;
	bezierPaths.forEach((path) => {
		ctx.beginPath();
		ctx.moveTo(path[0][0].x, path[0][0].y);
		path.forEach((bezier) => {
			let p0 = bezier[0];
			let p1 = bezier[1] ? bezier[1] : bezier[0];
			let p2 = bezier[2] ? bezier[2] : bezier[3];
			let p3 = bezier[3];
			ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
			drawPoint(p0, ctx);
			drawHandle(p1, ctx);
			drawHandle(p2, ctx);
			drawPoint(p3, ctx);
		});
		ctx.strokeStyle = 'rgb(200, 0, 0)';
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
		ctx.fill();
	});
}

function drawPoint(point, ctx) {
	ctx.save();
	ctx.fillStyle = 'rgb(100, 0, 0)';
	ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
	ctx.restore();
}

function drawHandle(point, ctx) {
	ctx.save();
	ctx.strokeStyle = 'rgb(100, 0, 0)';
	ctx.strokeRect(point.x - 2, point.y - 2, 4, 4);
	ctx.restore();
}
