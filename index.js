
import pathBounds from 'svg-path-bounds'
import isSvgPath from 'is-svg-path'
import bitmapSdf from 'bitmap-sdf'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

export default function pathSdf (path, o={}) {
	if (!isSvgPath(path)) throw Error('Invalid SVG path')

	let w, h

	if (o.shape || Array.isArray(o)) [w,h] = o.shape || o
	else w = canvas.width = o.width || o.w || 200, h = canvas.height = o.height || o.h || 200

	let size = Math.min(w, h)
	let stroke = o.stroke || 0
	let viewbox = o.viewbox || o.viewBox || pathBounds(path)
	let scale = [w / (viewbox[2] - viewbox[0]), h / (viewbox[3] - viewbox[1])]
	let maxScale = Math.min(scale[0] || 0, scale[1] || 0) / 2

	// clear ctx
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, w, h)

	ctx.fillStyle = 'white'

	if (stroke)	{
		if (typeof stroke != 'number') stroke = 1
		ctx.strokeStyle = stroke > 0 ? 'white' : 'black'
		ctx.lineWidth = Math.abs(stroke)
	}

	ctx.translate(w * .5, h * .5)
	ctx.scale(maxScale, maxScale)

	// if canvas svg paths api is available
	let path2d = new Path2D(path)
	ctx.fill(path2d)
	stroke && ctx.stroke(path2d)

	ctx.setTransform(1, 0, 0, 1, 0, 0);

	let data = bitmapSdf(ctx, {
		cutoff: o.cutoff != null ? o.cutoff : .5,
		radius: o.radius != null ? o.radius : size * .5
	})

	return data
}
