import { roundAndSanitize } from './svg-to-bezier.js';

/**
 * Converts an SVG Rect tag to Bezier Data Format
 * @param {object} tagData - Object with tag information
 * @returns {Array} - resulting path(s) in Bezier Data Format
 */
export function tagConvertRect(tagData) {
	let data = tagData.attributes || {};
	let x = roundAndSanitize(data.x) || 0;
	let y = roundAndSanitize(data.y) || 0;
	let w = roundAndSanitize(data.width) || 0;
	let h = roundAndSanitize(data.height) || 0;
	let right = x + w;
	let bottom = y + h;
	let upperLeft = { x: x, y: y };
	let upperRight = { x: right, y: y };
	let lowerRight = { x: right, y: bottom };
	let lowerLeft = { x: x, y: bottom };
	let bezierPath = [];

	// Handle radius corners
	if (data.rx || data.ry) {
		// Parse data allowing for missing or NaN values
		let rx = Number(data.rx);
		let ry = Number(data.ry);
		// If one radius is missing, use the other
		if (isNaN(rx) && !isNaN(ry)) rx = ry;
		if (isNaN(ry) && !isNaN(rx)) ry = rx;
		// If a radius is still NaN, set to zero
		if (isNaN(rx)) rx = 0;
		if (isNaN(ry)) ry = 0;
		// Ensure radii do not exceed half width/height
		if (rx > w / 2) rx = w / 2;
		if (ry > h / 2) ry = h / 2;

		// do rounded corners
		let handleWidth = rx * 0.448;
		let handleHeight = ry * 0.448;

		// Calculate curve start positions
		let leftXCurveStart = roundAndSanitize(x + rx);
		let rightXCurveStart = roundAndSanitize(right - rx);
		let topYCurveStart = roundAndSanitize(y + ry);
		let bottomYCurveStart = roundAndSanitize(bottom - ry);

		// Calculate handle positions
		let leftXHandle = roundAndSanitize(x + handleWidth);
		let rightXHandle = roundAndSanitize(right - handleWidth);
		let topYHandle = roundAndSanitize(y + handleHeight);
		let bottomYHandle = roundAndSanitize(bottom - handleHeight);

		bezierPath = [
			[{ x: leftXCurveStart, y: y }, false, false, { x: rightXCurveStart, y: y }],
			[
				{ x: rightXCurveStart, y: y },
				{ x: rightXHandle, y: y },
				{ x: right, y: topYHandle },
				{ x: right, y: topYCurveStart },
			],
			[{ x: right, y: topYCurveStart }, false, false, { x: right, y: bottomYCurveStart }],
			[
				{ x: right, y: bottomYCurveStart },
				{ x: right, y: bottomYHandle },
				{ x: rightXHandle, y: bottom },
				{ x: rightXCurveStart, y: bottom },
			],
			[{ x: rightXCurveStart, y: bottom }, false, false, { x: leftXCurveStart, y: bottom }],
			[
				{ x: leftXCurveStart, y: bottom },
				{ x: leftXHandle, y: bottom },
				{ x: x, y: bottomYHandle },
				{ x: x, y: bottomYCurveStart },
			],
			[{ x: x, y: bottomYCurveStart }, false, false, { x: x, y: topYCurveStart }],
			[
				{ x: x, y: topYCurveStart },
				{ x: x, y: topYHandle },
				{ x: leftXHandle, y: y },
				{ x: leftXCurveStart, y: y },
			],
		];
	} else {
		// do square corners
		bezierPath = [
			[upperLeft, false, false, upperRight],
			[upperRight, false, false, lowerRight],
			[lowerRight, false, false, lowerLeft],
			[lowerLeft, false, false, upperLeft],
		];
	}

	return [bezierPath];
}
