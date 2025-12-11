# SVG-to-Bézier

Convert SVG shape tags to their cubic Bézier equivalent.

## Purpose

This is meant to be a fairly complete way to dump an entire
SVG document in, and get a set of Bezier curves out. SVG has _a lot_ of features,
including things like colors, line weights, masks... many of these things do not really
make sense if we're just wanting to extract Bezier curves out of some vector information.

See the in-depth supported / not supported notes below.

## Quick Install

```sh
npm install svg-to-bezier
```

Then import and use in your project:

```js
import { SVGtoBezier } from 'svg-to-bezier';
```

# Support

## What is supported

In general, this library supports all SVG tags in the [Shape Elements](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element#shape_elements) category (besides text and image). Also supported are tags from the [Structural Elements](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element#structural_elements) category.

Default values are shown for attributes.

- `<circle cx="0" cy="0" r="0">`
- `<ellipse cx="0" cy="0" rx="0" ry="0">`
- `<line x1="0" y1="0" x2="0" y2="0">`
- `<path d="">`
- `<polygon points="">`
- `<polyline points="">`
- `<rect x="0" y="0" rx="" ry="" width="0" height="0">`
- `<use>` links are supported

On any tag, including the `<g>` tag, `transform` and `transform-origin` attributes are supported.

## Notes for supported tags and attributes

Supported tags that exist within nested `<g>` tags will be processed, but the
overall result will be 'flattened' / grouping will be lost.

The `d` attribute in the `<path>` tag can get crazy complex (technically speaking)
but one thing to note is the "Arc-to" commands `A` and `a` cannot be directly converted
to Bezier curves with mathematical precision. A curve-fitting estimation is used to
approximate the arc within a certain threshold. It is lossy.

## What's not supported

### Attributes

- Many attributes in SVG, like `x`, `y`, `cx`, `cy`, `r`, `rx`, `ry`,
  `width`, and `height` can have value types of "length" or "percentage". Attributes
  in percentage format will cause the converter to fail.
- `pathLength` attribute is not supported (sometimes used to reduce a path to a certain length).
- `viewBox` is ignored and cannot be used to move or crop objects.

### Tags

Unless specifically mentioned, no other tags are supported. There are other tags that are visual in nature that are worth pointing out specifically as _not_ supported:

- `<pattern>`
- `<mask>`
- `<marker>`
- `<text>`, `textPath>`, `tspan>`
- `<foreignObject>`
- `<image>`

# Bezier Data Format

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

**Path**: Single path, which is a collection of Bezier curves. Where point3 of bezier(n) should equal point0 of bezier(n+1)

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

# Dev notes

Working files are kept in the `/src` folder, and a snapshot of the latest stable release is kept in the `/dist` folder.

Another large part of this library is the test suite. If you run a simple web server (something like `npx run http-server`) from the root directory, there are two test files available:

- `_test_file.html` allows you to drag+drop a .svg file, run the conversion, and the results are shown both as code and visually on a Canvas.
- `_test_suite.html` runs a huge collection of sample .svg files through the conversion. The output shows:
  - The original svg visually
  - The original svg as code
  - The converted Bezier Format drawn to a canvas
  - The converted Bezier Format as JSON code

For each of these test tools, they try to make it easy to "visually confirm" or "visually debug" the conversion process. Because SVG is an inherently visual format, there is no way to programmatically run tests on the conversion output. Somebody has to just see the results and confirm it's as expected.

The set of test .svg files is (hopefully) a complete set of everything SVG can draw... whenever we add features or fix a bug, we also add a test file. But, since SVG is large and complex, there is a chance we missed some strange edge case.

Email matt@mattlag.com or mail@glyphrstudio.com if you encounter any strangeness.

# License & Copyright

Copyright © 2025 Matthew LaGrandeur

Released under [GPL 3.0](https://www.gnu.org/licenses/gpl-3.0-standalone.html)

## Author

| ![Matthew LaGrandeur's picture](https://1.gravatar.com/avatar/f6f7b963adc54db7e713d7bd5f4903ec?s=70) |
| ---------------------------------------------------------------------------------------------------- |
| [Matthew LaGrandeur](http://mattlag.com/)                                                            |
| matt[at]mattlag[dot]com                                                                              |
