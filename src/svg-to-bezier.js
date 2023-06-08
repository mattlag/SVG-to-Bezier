/*
	SVG to Bezier
	
	=================================================================

	"Bezier Data Format"

	- Point
		{x: Number, y: Number}            // simple x/y object

	- Bezier curve (Collection of 2 or 4 points)
		[point0, point1, point2, point3]  // 'Regular' Bezier curve notation
		or
		[point0, false, false, point3]    // straight lines have no point1 or point2

	- Path (collection of Bezier curves)
		[bezier1, bezier2, ...]           // where point3 of bezier(n) should equal point0 of bezier(n+1)

	- Bezier Paths (collection of Paths)
		[path1, path2, ...]

	=================================================================
*/

import { tagConvertCircleEllipse } from './tag-convert-circle-ellipse.js';
import { tagConvertPolygonPolyline } from './tag-convert-polygon-polyline.js';
import { tagConvertPath } from './tag-convert-path.js';
import { tagConvertRect } from './tag-convert-rect.js';
import { XMLtoJSON } from './xml-to-json.js';

/**
 * Takes an input SVG document in string format, and converts it to
 * a JSON object in Bezier Data Format.
 * @param {String} inputSVG - xml svg to convert
 * @returns {Array} - collection of Paths in Bezier Data Format
 */
export function SVGtoBezier(inputSVG) {
	console.log(`\nSVGtoBezier`);
	console.log(inputSVG);
	let svgDocumentData = XMLtoJSON(inputSVG);
	console.log(svgDocumentData);
	let bezierPaths = convertTags(svgDocumentData);
	console.log(bezierPaths);
	return bezierPaths;
}

/**
 * Recursively look through the SVG data and convert individual tags
 * @param {Object} tagData - XML to JSON format of a SVG Tag, it's attributes, and content
 * @returns {Array} - collection of Paths in Bezier Data Format
 */
function convertTags(tagData) {
	let result = [];

	if (!tagData?.content) return [];

	tagData.content.forEach((tag) => {
		console.log(`Starting conversion for ${tag.name} - result.length = ${result.length}`);
		if (
			tag.name.toLowerCase() === 'circle' ||
			tag.name.toLowerCase() === 'ellipse'
		) {
			console.log(`MATCHED ${tag.name.toLowerCase()} as CIRCLE or ELLIPSE`);
			result = result.concat(tagConvertCircleEllipse(tag));
		}
		if (tag.name.toLowerCase() === 'path') {
			console.log(`MATCHED ${tag.name.toLowerCase()} as PATH`);
			result = result.concat(tagConvertPath(tag));
		}
		if (
			tag.name.toLowerCase() === 'polygon' ||
			tag.name.toLowerCase() === 'polyline'
		) {
			console.log(`MATCHED ${tag.name.toLowerCase()} as POLYGON or POLYLINE`);
			result = result.concat(tagConvertPolygonPolyline(tag));
		}
		if (tag.name.toLowerCase() === 'rect') {
			console.log(`MATCHED ${tag.name.toLowerCase()} as RECT`);
			result = result.concat(tagConvertRect(tag));
		}
		if (tag.name.toLowerCase() === 'g') {
			console.log(`MATCHED ${tag.name.toLowerCase()} as G`);
			result = result.concat(convertTags(tag.content));
		}

		console.log(`END for ${tag.name} - result.length = ${result.length}`);
	});

	return result;
}

/*
 * Common Functions
 */

/**
 * Takes a string of number data and makes it easier to work with.
 * @param {String} data - data from an XML attribute
 * @returns {String} sanitized numbers separated by commas
 */
export function sanitizeParameterData(data) {
	// Clean up whitespace and replace with commas
	data = data.replace(/\s+/g, ',');

	// Clean up numbers
	//		Maintain scientific notation e+ and e- numbers
	//		Commas before all negative numbers
	//		Remove + to denote positive numbers
	data = data.replace(/e/gi, 'e');

	data = data.replace(/e-/g, '~~~');
	data = data.replace(/-/g, ',-');
	data = data.replace(/~~~/g, 'e-');

	data = data.replace(/e\+/g, '~~~');
	data = data.replace(/\+/g, ',');
	data = data.replace(/~~~/g, 'e+');

	// Clean up commas
	data = data.replace(/,+/g, ',');

	return data;
}

/**
 * Takes a string that came from an XML Attribute, and splits it into an array of numbers.
 * It's good to call 'sanitizeParameterData' somewhere before this.
 * In addition to chunking, this also checks for "Decimal number string" notation.
 * @param {String} data - data from an attribute, hopefully numbers separated by commas
 * @returns {Array} individual parameters chunked into an array
 */
export function chunkAndValidateParameters(data = '') {
	// Validate and chunk numeric data
	let validatedParameters = [];

	if (data.charAt(0) === ',') {
		data = data.substring(1);
	}

	if (data.charAt(data.length - 1) === ',') {
		data = data.substring(0, data.length - 1);
	}

	if (data.length > 0) {
		data = data.split(',');

		// Handle sequence of decimal numbers without spaces or leading zeros
		// like: 123.45.67.89 should be 123.45, 0.67, 0.89
		data.forEach((param) => {
			param = param.split('.');

			if (param.length === 1) validatedParameters.push(Number(param[0]));
			else if (param.length === 2)
				validatedParameters.push(Number(param.join('.')));
			else if (param.length > 2) {
				validatedParameters.push(Number(`${param[0]}.${param[1]}`));
				for (let p = 2; p < param.length; p++) {
					validatedParameters.push(Number(`0.${param[p]}`));
				}
			}
		});

		// validatedParameters = parameters.map(x => Number(x));
	}

	return validatedParameters;
}
