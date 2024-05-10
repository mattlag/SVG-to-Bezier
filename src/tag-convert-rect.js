import { roundAndSanitize } from "./svg-to-bezier.js";

/**
 * Converts an SVG Rect tag to Bezier Data Format
 * @param {object} tagData - Object with tag information
 * @returns {Array} - resulting path(s) in Bezier Data Format
 */
export function tagConvertRect(tagData) {
	let data = tagData.attributes || {};
	let x = roundAndSanitize(data.x) || 0;
	let y = roundAndSanitize(data.y) || 0;
	let w = roundAndSanitize(data.width) || 100;
	let h = roundAndSanitize(data.height) || 100;
	let right = x + w;
	let bottom = y + h;
	let upperLeft = { x: x, y: y };
	let upperRight = { x: right, y: y };
	let lowerRight = { x: right, y: bottom };
	let lowerLeft = { x: x, y: bottom };

	let bezierPath = [
		[upperLeft, false, false, upperRight],
		[upperRight, false, false, lowerRight],
		[lowerRight, false, false, lowerLeft],
		[lowerLeft, false, false, upperLeft],
	];

	return [bezierPath];
}
