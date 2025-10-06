import {
	chunkAndValidateParameters,
	// log,
	roundAndSanitize,
	sanitizeParameterData,
} from './svg-to-bezier.js';

/**
 * Converts an SVG Polygon or Polyline tag to Bezier Data Format
 * @param {object} tagData - Object with tag information
 * @returns {Array} - resulting path(s) in Bezier Data Format
 */
export function tagConvertPolygonPolyline(tagData) {
	// log(`\ntagConvertPolygonPolyline`);
	// log('tagData');
	// log(tagData);

	let bezierPath = [];
	let initialData = tagData?.attributes?.points;
	initialData = sanitizeParameterData(initialData);
	let data = chunkAndValidateParameters(initialData);

	// log('Polyline or Polygon data, cleaned & formatted:');
	// log(data);

	let firstX = Number(data[0]) || 0;
	let firstY = Number(data[1]) || 0;
	let previousX = Number(data[0]) || 0;
	let previousY = Number(data[1]) || 0;

	if (data.length > 4) {
		for (let i = 0; i < data.length; i += 2) {
			let px = Number(data[i]) || 0;
			let py = Number(data[i + 1]) || 0;
			bezierPath.push([
				{ x: roundAndSanitize(previousX), y: roundAndSanitize(previousY) },
				false,
				false,
				{ x: roundAndSanitize(px), y: roundAndSanitize(py) },
			]);
			previousX = px;
			previousY = py;
		}
	}

	if (tagData.name === 'polygon' && data.length > 2) {
		// Polygons are closed by default, Polylines are not
		bezierPath.push([
			{ x: roundAndSanitize(previousX), y: roundAndSanitize(previousY) },
			false,
			false,
			{ x: roundAndSanitize(firstX), y: roundAndSanitize(firstY) },
		]);
	}

	return [bezierPath];
}
