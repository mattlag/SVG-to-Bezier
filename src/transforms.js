import { floatSanitize, log, round } from "./svg-to-bezier.js";
const roundValues = true;

export function getTransformData(tag) {
	// log(`getTransformData`);
	/*
		`transform` attribute
			matrix(a,b,c,d,e,f)
			translate(x, y) 	// default (0,0)
			scale(x, y) 			// if only x, y = x
			rotate(a, x, y) 	// if no x,y use 0,0
			skewX(a) 					// degrees horizontal
			skewY(a) 					// degrees vertical

		`transform-origin` attribute
			(x, y, z) 				// default to 0,0 - ignore z value
												// ignore keyword values
	*/

	// toLowerCase is called to identify these
	const supported = ["matrix", "translate", "scale", "rotate", "skewx", "skewy"];
	let transforms = false;
	if (tag?.attributes?.transform) {
		// log(`Detected transforms`);
		let temp = tag.attributes.transform.replaceAll(",", " ");
		temp = temp.replaceAll("  ", " ");
		temp = temp.toLowerCase();
		temp = temp.split(")");
		transforms = [];
		temp.forEach((value) => {
			let data = value.split("(");
			if (data.length === 2) {
				data[0] = data[0].trim();
				data[1] = data[1].trim();
				if (supported.indexOf(data[0]) > -1) {
					let validatedArgs = data[1].split(" ");
					validatedArgs = validatedArgs.map((arg) => parseFloat(arg));
					transforms.push({
						name: data[0],
						args: validatedArgs,
					});
				}
			}
		});
	}

	log(transforms);
	return transforms;
}

export function applyTransformData(bezierPaths = [], transformData = []) {
	log(`\napplyTransformData`);
	log(`\t P A S S E D\n`);
	log("bezierPaths");
	log(JSON.stringify(bezierPaths));
	log("transformData");
	log(transformData);
	const resultBezierPaths = structuredClone(bezierPaths);
	const orderedTransforms = transformData.reverse();
	log(`\t V A L I D A T E D\n`);
	log(`\t RESULT BEZIER PATHS (start)\n`);
	log(JSON.stringify(resultBezierPaths));
	log(`\t ORDERED TRANSFORMS\n`);
	log(JSON.stringify(orderedTransforms));

	orderedTransforms.forEach((oneTransform) => {
		if (transformCurve[oneTransform.name]) {
			log(`\n\t${oneTransform.name}`);
			resultBezierPaths.forEach((singlePath, pathIndex) => {
				singlePath.forEach((singleCurve, curveIndex) => {
					log(`\n~~~ TRANSFORM CURVE ${curveIndex}`);
					// log(`\t\tbefore transform:`);
					// logCurve(singleCurve);

					resultBezierPaths[pathIndex][curveIndex] = transformCurve[oneTransform.name](singleCurve, oneTransform.args);

					// log(`\t\tafter transform:`);
					// logCurve(resultBezierPaths[pathIndex][curveIndex]);
				});
			});
		}
	});

	log(`\n\t AFTER TRANSFORM PATHS\n`);
	log(JSON.stringify(resultBezierPaths));
	return resultBezierPaths;
}

/*
		Individual transform functions
*/

const transformCurve = {
	matrix: matrixTransformCurve,
	translate: translateTransformCurve,
	scale: scaleTransformCurve,
	rotate: rotateTransformCurve,
	skewx: skewxTransformCurve,
	skewy: skewyTransformCurve,
};

function matrixTransformCurve(curve = [], args = []) {
	const resultCurve = [];
	while (args.length < 6) args.push(0);
	log(`\t\tmatrix: ${args.toString()}`);

	function matrixTransformPoint(oldPoint) {
		if (oldPoint === false) return false;
		const oldX = oldPoint.x;
		const oldY = oldPoint.y;
		const newPoint = { x: 0, y: 0 };
		newPoint.x = floatSanitize(1 * args[0] * oldX + 1 * args[2] * oldY + 1 * args[4]);
		newPoint.y = floatSanitize(1 * args[1] * oldX + 1 * args[3] * oldY + 1 * args[5]);

		if (roundValues) {
			newPoint.x = round(newPoint.x, 3);
			newPoint.y = round(newPoint.y, 3);
		}

		return newPoint;
	}

	resultCurve[0] = matrixTransformPoint(curve[0]);
	resultCurve[1] = matrixTransformPoint(curve[1]);
	resultCurve[2] = matrixTransformPoint(curve[2]);
	resultCurve[3] = matrixTransformPoint(curve[3]);

	return resultCurve;
}

function translateTransformCurve(curve = [], args = {}) {
	const resultCurve = [];
	const dx = args[0];
	const dy = args[1];
	log(`\t\ttranslate: ${dx}, ${dy}`);
	log(`\t\tcurve[0]: ${curve[0].x}, ${curve[0].y}`);

	function calculateNewPoint(oldPoint) {
		if (oldPoint === false) return false;
		const newPoint = { x: 0, y: 0 };
		newPoint.x = floatSanitize(oldPoint.x + dx);
		newPoint.y = floatSanitize(oldPoint.y + dy);

		if (roundValues) {
			newPoint.x = round(newPoint.x, 3);
			newPoint.y = round(newPoint.y, 3);
		}

		return newPoint;
	}

	resultCurve[0] = calculateNewPoint(curve[0]);
	resultCurve[1] = calculateNewPoint(curve[1]);
	resultCurve[2] = calculateNewPoint(curve[2]);
	resultCurve[3] = calculateNewPoint(curve[3]);

	return resultCurve;
}

function scaleTransformCurve(curve = [], args = []) {
	const scaleX = args[0];
	let scaleY = args[1];
	if (!scaleY) scaleY = scaleX;
	const resultCurve = [];
	log(`\t\tscale args: ${args.toString()}`);
	log(`\t\tscale validated: ${scaleX}, ${scaleY}`);

	function calculateNewPoint(oldPoint) {
		if (oldPoint === false) return false;
		const newPoint = { x: 0, y: 0 };
		newPoint.x = floatSanitize(oldPoint.x * scaleX);
		newPoint.y = floatSanitize(oldPoint.y * scaleY);

		if (roundValues) {
			newPoint.x = round(newPoint.x, 3);
			newPoint.y = round(newPoint.y, 3);
		}

		return newPoint;
	}

	resultCurve[0] = calculateNewPoint(curve[0]);
	resultCurve[1] = calculateNewPoint(curve[1]);
	resultCurve[2] = calculateNewPoint(curve[2]);
	resultCurve[3] = calculateNewPoint(curve[3]);

	return resultCurve;
}

function rotateTransformCurve(curve = [], args = []) {
	const angle = angleToRadians(args[0]);
	const about = { x: 0, y: 0 };
	if (args[1]) about.x = args[1];
	if (args[2]) about.y = args[2];

	const resultCurve = [];
	log(`\t\trotate args: ${args.toString()}`);
	log(`\t\trotate validated: ${angle}`);
	log(`\t\trotate about: ${about.x}, ${about.y}`);

	function calculateNewPoint(point) {
		if (!point) return false;

		const newPoint = { x: 0, y: 0 };
		newPoint.x = floatSanitize(Math.cos(angle) * (point.x - about.x) - Math.sin(angle) * (point.y - about.y) + about.x);
		newPoint.y = floatSanitize(Math.sin(angle) * (point.x - about.x) + Math.cos(angle) * (point.y - about.y) + about.y);

		if (roundValues) {
			newPoint.x = round(newPoint.x, 3);
			newPoint.y = round(newPoint.y, 3);
		}

		// log(newPoint);
		// log('rotate', 'end');
		return newPoint;
	}

	resultCurve[0] = calculateNewPoint(curve[0]);
	resultCurve[1] = calculateNewPoint(curve[1]);
	resultCurve[2] = calculateNewPoint(curve[2]);
	resultCurve[3] = calculateNewPoint(curve[3]);

	return resultCurve;
}

function skewxTransformCurve(curve = [], args = []) {
	const resultCurve = [];
	log(`\t\tskewx: ${args.toString()}`);
	const radians = angleToRadians(args[0]);
	const yMultiplier = Math.tan(radians);

	function calculateNewPoint(oldPoint) {
		if (!oldPoint) return false;
		const oldX = oldPoint.x;
		const oldY = oldPoint.y;
		const newPoint = { x: 0, y: 0 };

		newPoint.x = floatSanitize(oldX + yMultiplier * oldY);
		newPoint.y = floatSanitize(oldY);

		if (roundValues) {
			newPoint.x = round(newPoint.x, 3);
			newPoint.y = round(newPoint.y, 3);
		}

		return newPoint;
	}

	resultCurve[0] = calculateNewPoint(curve[0]);
	resultCurve[1] = calculateNewPoint(curve[1]);
	resultCurve[2] = calculateNewPoint(curve[2]);
	resultCurve[3] = calculateNewPoint(curve[3]);

	return resultCurve;
}

function skewyTransformCurve(curve = [], args = []) {
	const resultCurve = [];
	log(`\t\tskewy: ${args.toString()}`);
	const radians = angleToRadians(args[0]);
	const xMultiplier = Math.tan(radians);

	function calculateNewPoint(oldPoint) {
		if (!oldPoint) return false;
		const oldX = oldPoint.x;
		const oldY = oldPoint.y;
		const newPoint = { x: 0, y: 0 };

		newPoint.x = floatSanitize(oldX);
		newPoint.y = floatSanitize(oldY + xMultiplier * oldX);

		if (roundValues) {
			newPoint.x = round(newPoint.x, 3);
			newPoint.y = round(newPoint.y, 3);
		}

		return newPoint;
	}

	resultCurve[0] = calculateNewPoint(curve[0]);
	resultCurve[1] = calculateNewPoint(curve[1]);
	resultCurve[2] = calculateNewPoint(curve[2]);
	resultCurve[3] = calculateNewPoint(curve[3]);

	return resultCurve;
}

function angleToRadians(angle) {
	let result = (Math.PI / 180) * parseFloat(angle);
	return result;
}

function logCurve(curve) {
	// console.log(JSON.stringify(curve));
	console.table({
		x: [curve[0].x, curve[1]?.x, curve[2]?.x, curve[3].x],
		y: [curve[0].y, curve[1]?.y, curve[2]?.y, curve[3].y],
	});
}

/*
	SAMPLE

	[
		[
			[{"x":10,"y":30},{"x":10,"y":14},{"x":26,"y":4},{"x":40,"y":12}],
			[{"x":40,"y":12},{"x":46,"y":16},{"x":50,"y":22},{"x":50,"y":30}],
			[{"x":50,"y":30},{"x":50,"y":14},{"x":66,"y":4},{"x":80,"y":12}],
			[{"x":80,"y":12},{"x":86,"y":16},{"x":90,"y":22},{"x":90,"y":30}],
			[{"x":90,"y":30},{"x":90,"y":50},{"x":76,"y":70},{"x":50,"y":90}],
			[{"x":50,"y":90},{"x":23,"y":70},{"x":10,"y":50},{"x":10,"y":30}]
		],
		[
			[{"x":10,"y":30},{"x":10,"y":14},{"x":26,"y":4},{"x":40,"y":12}],
			[{"x":40,"y":12},{"x":46,"y":16},{"x":50,"y":22},{"x":50,"y":30}],
			[{"x":50,"y":30},{"x":50,"y":14},{"x":66,"y":4},{"x":80,"y":12}],
			[{"x":80,"y":12},{"x":86,"y":16},{"x":90,"y":22},{"x":90,"y":30}],
			[{"x":90,"y":30},{"x":90,"y":50},{"x":76,"y":70},{"x":50,"y":90}],
			[{"x":50,"y":90},{"x":23,"y":70},{"x":10,"y":50},{"x":10,"y":30}]
		]
	]
*/
