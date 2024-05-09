import { log, round } from './svg-to-bezier.js';
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
	const supported = [
		'matrix',
		'translate',
		'scale',
		'rotate',
		'skewx',
		'skewy',
	];
	let transforms = false;
	if (tag?.attributes?.transform) {
		// log(`Detected transforms`);
		let temp = tag.attributes.transform.replaceAll(',', ' ');
		temp = temp.replaceAll('  ', ' ');
		temp = temp.toLowerCase();
		temp = temp.split(')');
		transforms = [];
		temp.forEach((value) => {
			let data = value.split('(');
			if (data.length === 2) {
				data[0] = data[0].trim();
				data[1] = data[1].trim();
				if (supported.indexOf(data[0]) > -1) {
					transforms.push({
						name: data[0],
						args: data[1].split(' '),
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
	log(`\n\t STARTING PATHS\n`);
	log(JSON.stringify(bezierPaths));
	log(transformData);
	const resultBezierPaths = [];

	for (let p = 0; p < bezierPaths.length; p++) {
		let singlePath = bezierPaths[p];
		resultBezierPaths[p] = [];

		for (let s = 0; s < singlePath.length; s++) {
			let singleCurve = singlePath[s];
			resultBezierPaths[p][s] = applyTransformDataToCurve(
				singleCurve,
				transformData
			);
		}
	}

	log(`\n\t AFTER TRANSFORM PATHS\n`);
	log(JSON.stringify(resultBezierPaths[0]));
	return resultBezierPaths[0];
}

function applyTransformDataToCurve(curve, transformData = []) {
	log(`\n\t\tapplyTransformDataToCurve`);
	let resultCurve = curve;
	const orderedTransforms = transformData.reverse();

	log(JSON.stringify)
	orderedTransforms.forEach((oneTransform) => {
		if (transformCurve[oneTransform.name]) {
			log(`\t\t${oneTransform.name}`);
			resultCurve = transformCurve[oneTransform.name](
				resultCurve,
				oneTransform.args
			);
		}
	});

	return resultCurve;
}

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
	log(`\t\tbefore transform:`);
	logCurve(curve);

	function matrixTransformPoint(oldPoint) {
		if (oldPoint === false) return false;
		const oldX = parseFloat(oldPoint.x);
		const oldY = parseFloat(oldPoint.y);
		const newPoint = { x: 0, y: 0 };
		newPoint.x = 1 * args[0] * oldX + 1 * args[2] * oldY + 1 * args[4];
		newPoint.y = 1 * args[1] * oldX + 1 * args[3] * oldY + 1 * args[5];

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

	log(`\t\tafter transform:`);
	logCurve(resultCurve);
	return resultCurve;
}

function translateTransformCurve(curve = [], args = {}) {
	const resultCurve = [];
	const dx = parseFloat(args[0]);
	const dy = parseFloat(args[1]);
	log(`\t\ttranslate: ${dx}, ${dy}`);
	log(`\t\tcurve[0]: ${curve[0].x}, ${curve[0].y}`);
	log(`\t\tbefore transform:`);
	logCurve(curve);

	// Base point
	resultCurve[0] = { x: 0, y: 0 };
	resultCurve[0].x = parseFloat(curve[0].x) + dx;
	resultCurve[0].y = parseFloat(curve[0].y) + dy;

	// Base point handle
	if (curve[1]) {
		resultCurve[1] = { x: 0, y: 0 };
		resultCurve[1].x = parseFloat(curve[1].x) + dx;
		resultCurve[1].y = parseFloat(curve[1].y) + dy;
	} else {
		resultCurve[1] = false;
	}

	// Destination point handle
	if (curve[2]) {
		resultCurve[2] = { x: 0, y: 0 };
		resultCurve[2].x = parseFloat(curve[2].x) + dx;
		resultCurve[2].y = parseFloat(curve[2].y) + dy;
	} else {
		resultCurve[2] = false;
	}

	// Destination point
	resultCurve[3] = { x: 0, y: 0 };
	resultCurve[3].x = parseFloat(curve[3].x) + dx;
	resultCurve[3].y = parseFloat(curve[3].y) + dy;

	log(`\t\tafter transform:`);
	logCurve(resultCurve);
	return resultCurve;
}

function scaleTransformCurve(curve = [], args = []) {
	const scaleX = parseFloat(args[0]);
	let scaleY = parseFloat(args[1]);
	if (!scaleY) scaleY = scaleX;
	const resultCurve = [];
	log(`\t\tscale args: ${args.toString()}`);
	log(`\t\tscale validated: ${scaleX}, ${scaleY}`);
	log(`\t\tbefore transform:`);
	logCurve(curve);

	function calculateNewPoint(oldPoint) {
		if (oldPoint === false) return false;
		const newPoint = { x: 0, y: 0 };
		newPoint.x = parseFloat(oldPoint.x) * scaleX;
		newPoint.y = parseFloat(oldPoint.y) * scaleY;

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

	log(`\t\tafter transform:`);
	logCurve(resultCurve);
	return resultCurve;
}

function rotateTransformCurve(curve = [], args = []) {
	const angle = angleToRadians(args[0]);
	const about = { x: 0, y: 0 };
	const resultCurve = [];
	log(`\t\trotate args: ${args.toString()}`);
	log(`\t\trotate validated: ${angle}`);
	log(`\t\tbefore transform:`);
	logCurve(curve);

	function rotatePoint(point) {
		log('rotate', 'start');
		log('point ' + JSON.stringify(point));
		// log('Math angle:\t' + angle);
		// log('about ' + json(about, true));

		if (!angle || !point) return false;

		const newPoint = { x: 0, y: 0 };
		point.x -= about.x;
		point.y -= about.y;

		const newX = point.x * Math.cos(angle) - point.y * Math.sin(angle);
		const newY = point.x * Math.sin(angle) + point.y * Math.cos(angle);

		newPoint.x = newX + about.x;
		newPoint.y = newY + about.y;

		if (roundValues) {
			newPoint.x = round(newPoint.x, 3);
			newPoint.y = round(newPoint.y, 3);
		}

		// log(newPoint);
		// log('rotate', 'end');
		return newPoint;
	}

	resultCurve[0] = rotatePoint(curve[0]);
	resultCurve[1] = rotatePoint(curve[1]);
	resultCurve[2] = rotatePoint(curve[2]);
	resultCurve[3] = rotatePoint(curve[3]);

	log(`\t\tafter transform:`);
	logCurve(resultCurve);
	return resultCurve;
}

function skewxTransformCurve(curve = [], args = []) {
	const resultCurve = [];
	log(`\t\tskewx: ${args.toString()}`);
	log(`\t\tbefore transform:`);
	logCurve(curve);
	const radians = angleToRadians(args[0]);
	const yMultiplier = Math.tan(radians);

	function calculateNewPoint(oldPoint) {
		if (!oldPoint) return false;
		const oldX = parseFloat(oldPoint.x);
		const oldY = parseFloat(oldPoint.y);
		const newPoint = { x: 0, y: 0 };

		newPoint.x = oldX + yMultiplier * oldY;
		newPoint.y = oldY;

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

	log(`\t\tafter transform:`);
	logCurve(resultCurve);
	return resultCurve;
}

function skewyTransformCurve(curve = [], args = []) {
	const resultCurve = [];
	log(`\t\tskewy: ${args.toString()}`);
	log(`\t\tbefore transform:`);
	logCurve(curve);
	const radians = angleToRadians(args[0]);
	const xMultiplier = Math.tan(radians);

	function calculateNewPoint(oldPoint) {
		if (!oldPoint) return false;
		const oldX = parseFloat(oldPoint.x);
		const oldY = parseFloat(oldPoint.y);
		const newPoint = { x: 0, y: 0 };

		newPoint.x = oldX;
		newPoint.y = oldY + xMultiplier * oldX;

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

	log(`\t\tafter transform:`);
	logCurve(resultCurve);
	return resultCurve;
}

function angleToRadians(angle) {
	let result = (Math.PI / 180) * parseFloat(angle);
	return result;
}

function logCurve(curve) {
	console.table({
		'x': [curve[0].x, curve[1]?.x, curve[2]?.x, curve[3].x],
		'y': [curve[0].y, curve[1]?.y, curve[2]?.y, curve[3].y]
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
