import { log } from './svg-to-bezier.js';

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
		let temp = tag.attributes.transform.replace(',', ' ');
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

	// log(transforms);
	return transforms;
}

export function applyTransformData(bezierPaths = [], transformData = []) {
	log(`applyTransformData`);
	log(JSON.stringify(bezierPaths));
	log(`bezierPaths.length ${bezierPaths.length}`);
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

	return resultBezierPaths[0];
}

function applyTransformDataToCurve(curve, transformData = []) {
	log(`\t\tapplyTransformDataToCurve`);
	let resultCurve = curve;
	const orderedTransforms = transformData.reverse();
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
	while (args.length < 6) args.push(0);
	const resultCurve = [];
	const dx = parseFloat(args[0]);
	const dy = parseFloat(args[1]);
	log(
		`\t\tmatrix: ${args[0]}, ${args[1]}, ${args[2]}, ${args[3]}, ${args[4]}, ${args[5]},`
	);
	log(`\t\tbefore transform: ${JSON.stringify(curve)}`);

	function calculateNewPoint(oldPoint, matrix) {
		if (oldPoint === false) return false;
		const oldX = parseFloat(oldPoint.x);
		const oldY = parseFloat(oldPoint.y);
		const newPoint = { x: 0, y: 0 };
		newPoint.x = 1 * matrix[0] * oldX + 1 * matrix[2] * oldY + 1 * matrix[4];
		newPoint.y = 1 * matrix[1] * oldX + 1 * matrix[3] * oldY + 1 * matrix[5];
		return newPoint;
	}

	// Base point
	resultCurve[0] = calculateNewPoint(curve[0], args);

	// Base point handle
	resultCurve[1] = calculateNewPoint(curve[1], args);

	// Destination point handle
	resultCurve[2] = calculateNewPoint(curve[2], args);

	// Destination point
	resultCurve[3] = calculateNewPoint(curve[3], args);

	log(`\t\tafter transform: ${JSON.stringify(resultCurve)}`);
	return resultCurve;
}

function translateTransformCurve(curve = [], args = {}) {
	const resultCurve = [];
	const dx = parseFloat(args[0]);
	const dy = parseFloat(args[1]);
	log(`\t\ttranslate: ${dx}, ${dy}`);
	log(`\t\tcurve[0]: ${curve[0].x}, ${curve[0].y}`);
	log(`\t\tbefore transform: ${JSON.stringify(curve)}`);

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

	log(`\t\tafter transform: ${JSON.stringify(resultCurve)}`);
	return resultCurve;
}

function scaleTransformCurve(curve = [], args = {}) {}

function rotateTransformCurve(curve = [], args = {}) {}

function skewxTransformCurve(curve = [], args = {}) {}

function skewyTransformCurve(curve = [], args = {}) {}

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
