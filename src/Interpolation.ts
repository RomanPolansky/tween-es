export type InterpolationFunction = (v: number[], k: number) => number

const _linear = function (p0: number, p1: number, t: number): number {
	return (p1 - p0) * t + p0
}
const _bernstein = function (n: number, i: number): number {
	const fc = _factorial
	return fc(n) / fc(i) / fc(n - i)
}
const _factorial = (function () {
	const a = [1]

	return function (n: number): number {
		let s = 1

		if (a[n]) {
			return a[n]
		}

		for (let i = n; i > 1; i--) {
			s *= i
		}

		a[n] = s
		return s
	}
})()
const _catmullRom = function (p0: number, p1: number, p2: number, p3: number, t: number): number {
	const v0 = (p2 - p0) * 0.5
	const v1 = (p3 - p1) * 0.5
	const t2 = t * t
	const t3 = t * t2
	return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
}


export const linear: InterpolationFunction = function (v: number[], k: number): number {
	const m = v.length - 1
	const f = m * k
	const i = Math.floor(f)
	const fn = _linear

	if (k < 0) {
		return fn(v[0], v[1], f)
	}

	if (k > 1) {
		return fn(v[m], v[m - 1], m - f)
	}

	return fn(v[i], v[i + 1 > m ? m : i + 1], f - i)
}

export const bezier: InterpolationFunction = function (v: number[], k: number): number {
	let b = 0
	const n = v.length - 1
	const pw = Math.pow
	const bn = _bernstein

	for (let i = 0; i <= n; i++) {
		b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i)
	}

	return b
}

export const catmullRom: InterpolationFunction = function (v: number[], k: number): number {
	const m = v.length - 1
	let f = m * k
	let i = Math.floor(f)
	const fn = _catmullRom

	if (v[0] === v[m]) {
		if (k < 0) {
			i = Math.floor((f = m * (1 + k)))
		}

		return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i)
	} else {
		if (k < 0) {
			return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0])
		}

		if (k > 1) {
			return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m])
		}

		return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i)
	}
}

export default {
	linear,
	bezier,
	catmullRom,
}
