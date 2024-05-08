/*
	SVG to Bezier
	For more details, see: https://github.com/mattlag/SVG-to-Bezier
	Version: 1.--.--
	
	=================================================================

	"Bezier Data Format"

	- Point
		// simple x/y object
		{x: Number, y: Number}

	- Bezier curve (Collection of 2 or 4 points)
		// 'Regular' Bezier curve notation
		[point0, point1, point2, point3]
		or
			// straight lines have no point1 or point2
		[point0, false, false, point3]

	- Path (collection of Bezier curves)
		// where point3 of bezier(n) should equal point0 of bezier(n+1)
		[bezier1, bezier2, ...] 

	- Bezier Paths (collection of Paths)
		[path1, path2, ...]

	=================================================================
*/

import { tagConvertCircleEllipse } from './tag-convert-circle-ellipse.js';
import { tagConvertPath } from './tag-convert-path.js';
import { tagConvertPolygonPolyline } from './tag-convert-polygon-polyline.js';
import { tagConvertRect } from './tag-convert-rect.js';
import { applyTransformData, getTransformData } from './transforms.js';
import { XMLtoJSON } from './xml-to-json.js';

const enableConsoleLogging = true;

/**
 * Takes an input SVG document in string format, and converts it to
 * a JSON object in Bezier Data Format.
 * @param {String} inputSVG - xml svg to convert
 * @returns {Array} - collection of Paths in Bezier Data Format
 */
export function SVGtoBezier(inputSVG) {
	log(`\n\n========================\nSVGtoBezier`);
	log(inputSVG);
	let svgDocumentData = XMLtoJSON(inputSVG);
	log(`JSON DATA`);
	log(svgDocumentData);
	let bezierPaths = convertTags(svgDocumentData);
	log(bezierPaths);
	log(`\nSVGtoBezier\n========================\n\n`);
	return bezierPaths;
}

/**
 * Recursively look through the SVG data and convert individual tags
 * @param {Object} tagData - XML to JSON format of a SVG Tag, it's attributes, and content
 * @returns {Array} - collection of Paths in Bezier Data Format
 */
function convertTags(tagData) {
	log(`\n\nCONVERT TAGS - START ${tagData.name}`);
	log(tagData);
	if (!tagData?.content) return [];

	let result = [];
	const transformData = getTransformData(tagData);

	tagData.content.forEach((tag) => {
		log(`<<<<< tag ${tag.name}`);
		log(tag);
		const name = tag.name.toLowerCase();
		const tagTransforms = getTransformData(tag);
		log(`tagTransforms`);
		log(tagTransforms);

		if (convert[name]) {
			log(`\t converting ${tag.name}`);
			let convertedTag = convert[name](tag)[0];
			log(`converted tag: \n${JSON.stringify(convertedTag)}`);
			if (tagTransforms) {
				log(`\t transforming ${tag.name}`);
				convertedTag = applyTransformData([convertedTag], tagTransforms);
			}
			log(`transformed tag: \n${JSON.stringify(convertedTag)}`);
			// result = result.concat(convertedTag);
			result.push(convertedTag);
		}

		log(`>>>>> tag ${tag.name}`);
	});

	if (transformData) {
		log(`transforming ${tagData.name}`);
		result = applyTransformData(result[0], transformData);
	}

	log(`RESULT IS`);
	log(result);
	log(`CONVERT TAGS - END ${tagData.name}\n\n`);
	return result;
}

const convert = {
	circle: tagConvertCircleEllipse,
	ellipse: tagConvertCircleEllipse,
	path: tagConvertPath,
	glyph: tagConvertPath,
	polygon: tagConvertPolygonPolyline,
	polyline: tagConvertPolygonPolyline,
	rect: tagConvertRect,
	g: convertTags,
};

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

/*
	Helper functions
*/

export function log(message) {
	if (enableConsoleLogging) console.log(message);
}
