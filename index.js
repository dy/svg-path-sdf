'use strict'

const pathBounds = require('svg-path-bounds')
const parsePath = require('parse-svg-path')
const drawPath = require('draw-svg-path')
const isSvgPath = require('is-svg-path')
const bitmapSdf = require('bitmap-sdf')

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')


module.exports = pathSdf

function pathSdf (path, options) {
	if (!isSvgPath(path)) throw Error('Argument should be valid svg path string')

	if (!options) options = {}

	let w, h
	if (options.shape) {
		w = options.shape[0]
		h = options.shape[1]
	}
	else {
		w = canvas.width = options.w || options.width || 200
		h = canvas.height = options.h || options.height || 200
	}
	let size = Math.min(w, h)

	let bounds = pathBounds(path)
	let viewbox = options.viewbox || options.viewBox || bounds
	let dim = [(viewbox[2] - viewbox[0]), (viewbox[3] - viewbox[1])]
	let range = [bounds[2] - bounds[0], bounds[3] - bounds[1]]
	let scale = [w / dim[0], h / dim[1]]
	let maxScale = Math.min(scale[0] || 0, scale[1] || 0) / 2

	//clear ctx
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, w, h)

	ctx.fillStyle = 'white'
	ctx.strokeStyle = 'white'

	ctx.translate(w * .5, h * .5)
	ctx.scale(maxScale, maxScale)

	//if canvas svg paths api is available
	if (global.Path2D) {
		let path2d = new Path2D(path)
		ctx.fill(path2d)
		ctx.stroke(path2d)
	}
	//fallback to bezier-curves
	else {
		let segments = parsePath(path)
		drawPath(ctx, segments)
		ctx.fill()
		ctx.stroke()
	}

	ctx.setTransform(1, 0, 0, 1, 0, 0);

	let data = bitmapSdf(ctx, {
		cutoff: options.cutoff != null ? options.cutoff : .5,
		radius: options.radius != null ? options.radius : size * .5
	})

	return data
}
