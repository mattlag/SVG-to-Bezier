# SVG-to-Bézier
Convert SVG shape tags to their cubic Bézier equivalent.

## Purpose
This is meant to be a fairly complete (but not 100%) way to dump an entire
SVG document in, and get a set of Bezier curves out. SVG has *a lot* of features, 
including things like colors, transforms, masks... many of these things do not really 
make sense if we're just wanting to extract Bezier curves out of some vector information.

## What's supported
The following tags and attributes are supported. Default values are shown for attributes.
 - `<circle cx="0" cy="0" r="0">`
 - `<ellipse cx="0" cy="0" rx="100" ry="100">`
 - `<line x1="0" y1="0" x2="0" y2="0">`
 - `<path d="">`
 - `<polygon points="">`
 - `<polyline points="">`
 - `<rect x="0" y="0" width="100" height="100">`

## Notable exceptions
For the moment, the `transform` attribute is not supported - meaning whatever 
raw data is pulled from each local attribute will be the number used.

Supported tags that exist within nested `<g>` tags will be processed, but the 
overall result will be 'flattened' / grouping will be lost.

Many attributes in SVG, like `x`, `y`, `cx`, `cy`, `r`, `rx`, `ry`, 
`width`, and `height` can have value types of "length" or "percentage". Attributes 
in percentage format will cause the converter to fail.

The `d` attribute in the `<path>` tag can get crazy complex (technically speaking) 
but one thing to note is the "Arc-to" commands `A` and `a` cannot be directly converted 
to Bezier curves with mathematical precision. A curve-fitting estimation is used to 
approximate the arc within a certain threshold. It is lossy.

## Bezier Data Format
The returned format will have it's roots in the 'standard' Bezier
format, consisting of 4 x/y points. Since a single SVG document 
(and sometimes even a single `<path>` tag) could require many 
individual Bezier curves to describe it, the result that gets 
returned by this process is as follows:

**Point**: a simple x/y object
```
{x: Number, y: Number}
```

**Bezier curve**: Collection of 2 or 4 points.

'Regular' Bezier curve notation
```
[point0, point1, point2, point3]
```
or straight lines, which have no point1 or point2
```
[point0, false, false, point3]
```

**Path**: Collection of Bezier curves, where point3 of bezier(n) should equal point0 of bezier(n+1)
```
[bezier1, bezier2, ...]
```

**Bezier Paths**: Collection of Paths
```
[path1, path2, ...]
```

So, overall, a collection of 2 paths, each with 2 Bezier curves, may look like this:
```
[
	[
		[
			{x:100, y:100},
			{x:100, y:200},
			{x:300, y:300},
			{x:300, y:400},
		],
		[
			{x:400, y:400},
			{x:400, y:500},
			{x:600, y:600},
			{x:600, y:700},
		],
	],
	[
		[
			{x:1100, y:1100},
			{x:1100, y:1200},
			{x:1300, y:1300},
			{x:1300, y:1400},
		],
		[
			{x:1400, y:1400},
			{x:1400, y:1500},
			{x:1600, y:1600},
			{x:1600, y:1700},
		],
	],
]
```