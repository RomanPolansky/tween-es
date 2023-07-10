import Group from './Group'
import type { EasingFunction } from './Easing'
import Easing from './Easing'
import type { InterpolationFunction } from './Interpolation'
import Interpolation from './Interpolation'
import nextId from './nextId'

export type UnknownProps = Record<string, any>

export default class Tween<T extends UnknownProps> {
	private _isPaused = false
	private _pauseStart = 0
	private _valuesStart: UnknownProps = {}
	private _valuesEnd: Record<string, number | string> = {}
	private _valuesStartRepeat: UnknownProps = {}
	private _duration = 1000
	private _initialRepeat = 0
	private _repeat = 0
	private _repeatDelayTime?: number
	private _yoyo = false
	private _isPlaying = false
	private _reversed = false
	private _delayTime = 0
	private _startTime = 0
	private _easingFunction: EasingFunction = Easing.linear
	private _interpolationFunction: InterpolationFunction = Interpolation.linear
	private _chainedTweens: Array<Tween<any>> = []
	private _onStartCallback?: (object: T) => void
	private _onStartCallbackFired = false
	private _onEveryStartCallback?: (object: T) => void
	private _onEveryStartCallbackFired = false
	private _onUpdateCallback?: (object: T, elapsed: number) => void
	private _onRepeatCallback?: (object: T) => void
	private _onCompleteCallback?: (object: T) => void
	private _onStopCallback?: (object: T) => void
	private _id = nextId()
	private _isChainStopped = false

	constructor(private _object: T, private _group: Group = Group.shared) {}

	public getId(): number {
		return this._id
	}

	public isPlaying(): boolean {
		return this._isPlaying
	}

	public isPaused(): boolean {
		return this._isPaused
	}

	public to(properties: UnknownProps, duration?: number): this {
		// TODO? restore this, then update the 07_dynamic_to example to set fox
		// tween's to on each update. That way the behavior is opt-in (there's
		// currently no opt-out).
		// for (const prop in properties) this._valuesEnd[prop] = properties[prop]
		this._valuesEnd = Object.create(properties)

		if (duration !== undefined) {
			this._duration = duration
		}

		return this
	}

	public duration(d = 1000): this {
		this._duration = d
		return this
	}

	public start(time: number = this._group.getTime()): this {
		if (this._isPlaying) {
			return this
		}

		// eslint-disable-next-line
		this._group.add(this as any)

		this._repeat = this._initialRepeat

		if (this._reversed) {
			// If we were reversed (f.e. using the yoyo feature) then we need to
			// flip the tween direction back to forward.

			this._reversed = false

			for (const property in this._valuesStartRepeat) {
				this._swapEndStartRepeatValues(property)
				this._valuesStart[property] = this._valuesStartRepeat[property]
			}
		}

		this._isPlaying = true

		this._isPaused = false

		this._onStartCallbackFired = false
		this._onEveryStartCallbackFired = false

		this._isChainStopped = false

		this._startTime = time
		this._startTime += this._delayTime

		this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat)

		return this
	}

	private _setupProperties(
		_object: UnknownProps,
		_valuesStart: UnknownProps,
		_valuesEnd: UnknownProps,
		_valuesStartRepeat: UnknownProps,
	): void {
		for (const property in _valuesEnd) {
			const startValue = _object[property]
			const startValueIsArray = Array.isArray(startValue)
			const propType = startValueIsArray ? 'array' : typeof startValue
			const isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property])

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (propType === 'undefined' || propType === 'function') {
				continue
			}

			// Check if an Array was provided as property value
			if (isInterpolationList) {
				let endValues = _valuesEnd[property] as Array<number | string>

				if (endValues.length === 0) {
					continue
				}

				// handle an array of relative values
				endValues = endValues.map(this._handleRelativeValue.bind(this, startValue as number))

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [startValue].concat(endValues)
			}

			// handle the deepness of the values
			if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
				_valuesStart[property] = startValueIsArray ? [] : {}

				// eslint-disable-next-line
				for (const prop in startValue as object) {
					// eslint-disable-next-line
					// @ts-ignore FIXME?
					_valuesStart[property][prop] = startValue[prop]
				}

				_valuesStartRepeat[property] = startValueIsArray ? [] : {} // TODO? repeat nested values? And yoyo? And array values?

				// eslint-disable-next-line
				// @ts-ignore FIXME?
				this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property])
			} else {
				// Save the starting value, but only once.
				if (typeof _valuesStart[property] === 'undefined') {
					_valuesStart[property] = startValue
				}

				if (!startValueIsArray) {
					// eslint-disable-next-line
					// @ts-ignore FIXME?
					_valuesStart[property] *= 1.0 // Ensures we're using numbers, not strings
				}

				if (isInterpolationList) {
					// eslint-disable-next-line
					// @ts-ignore FIXME?
					_valuesStartRepeat[property] = _valuesEnd[property].slice().reverse()
				} else {
					_valuesStartRepeat[property] = _valuesStart[property] || 0
				}
			}
		}
	}

	public stop(): this {
		if (!this._isChainStopped) {
			this._isChainStopped = true
			this.stopChainedTweens()
		}

		if (!this._isPlaying) {
			return this
		}

		this._group.remove(this as any)

		this._isPlaying = false

		this._isPaused = false

		if (this._onStopCallback) {
			this._onStopCallback(this._object)
		}

		return this
	}

	public end(): this {
		this._goToEnd = true
		this.update(Infinity)
		return this
	}

	public pause(time: number = this._group.getTime()): this {
		if (this._isPaused || !this._isPlaying) {
			return this
		}

		this._isPaused = true

		this._pauseStart = time

		this._group.remove(this as any)

		return this
	}

	public resume(time: number = this._group.getTime()): this {
		if (!this._isPaused || !this._isPlaying) {
			return this
		}

		this._isPaused = false

		this._startTime += time - this._pauseStart

		this._pauseStart = 0

		this._group.add(this as any)

		return this
	}

	public stopChainedTweens(): this {
		for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
			this._chainedTweens[i].stop()
		}
		return this
	}

	public group(group = Group.shared): this {
		this._group = group
		return this
	}

	public delay(amount = 0): this {
		this._delayTime = amount
		return this
	}

	public repeat(times = 0): this {
		this._initialRepeat = times
		this._repeat = times
		return this
	}

	public repeatDelay(amount?: number): this {
		this._repeatDelayTime = amount
		return this
	}

	public yoyo(yoyo = false): this {
		this._yoyo = yoyo
		return this
	}

	public easing(easingFunction: EasingFunction = Easing.linear): this {
		this._easingFunction = easingFunction
		return this
	}

	public interpolation(interpolationFunction: InterpolationFunction = Interpolation.linear): this {
		this._interpolationFunction = interpolationFunction
		return this
	}

	// eslint-disable-next-line
	public chain(...tweens: Array<Tween<any>>): this {
		this._chainedTweens = tweens
		return this
	}

	public onStart(callback?: (object: T) => void): this {
		this._onStartCallback = callback
		return this
	}

	public onEveryStart(callback?: (object: T) => void): this {
		this._onEveryStartCallback = callback
		return this
	}

	public onUpdate(callback?: (object: T, elapsed: number) => void): this {
		this._onUpdateCallback = callback
		return this
	}

	public onRepeat(callback?: (object: T) => void): this {
		this._onRepeatCallback = callback
		return this
	}

	public onComplete(callback?: (object: T) => void): this {
		this._onCompleteCallback = callback
		return this
	}

	public onStop(callback?: (object: T) => void): this {
		this._onStopCallback = callback
		return this
	}

	private _goToEnd = false

	/**
	 * @returns true if the tween is still playing after the update, false
	 * otherwise (calling update on a paused tween still returns true because
	 * it is still playing, just paused).
	 */
	public update(time = this._group.getTime(), autoStart = true): boolean {
		if (this._isPaused) return true

		let property
		let elapsed

		const endTime = this._startTime + this._duration

		if (!this._goToEnd && !this._isPlaying) {
			if (time > endTime) return false
			if (autoStart) this.start(time)
		}

		this._goToEnd = false

		if (time < this._startTime) {
			return true
		}

		if (this._onStartCallbackFired === false) {
			if (this._onStartCallback) {
				this._onStartCallback(this._object)
			}

			this._onStartCallbackFired = true
		}

		if (this._onEveryStartCallbackFired === false) {
			if (this._onEveryStartCallback) {
				this._onEveryStartCallback(this._object)
			}

			this._onEveryStartCallbackFired = true
		}

		elapsed = (time - this._startTime) / this._duration
		elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed

		const value = this._easingFunction(elapsed)

		// properties transformations
		this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value)

		if (this._onUpdateCallback) {
			this._onUpdateCallback(this._object, elapsed)
		}

		if (elapsed === 1) {
			if (this._repeat > 0) {
				if (isFinite(this._repeat)) {
					this._repeat--
				}

				// Reassign starting values, restart by making startTime = now
				for (property in this._valuesStartRepeat) {
					if (!this._yoyo && typeof this._valuesEnd[property] === 'string') {
						this._valuesStartRepeat[property] =
							// eslint-disable-next-line
							// @ts-ignore FIXME?
							this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property])
					}

					if (this._yoyo) {
						this._swapEndStartRepeatValues(property)
					}

					this._valuesStart[property] = this._valuesStartRepeat[property]
				}

				if (this._yoyo) {
					this._reversed = !this._reversed
				}

				if (this._repeatDelayTime !== undefined) {
					this._startTime = time + this._repeatDelayTime
				} else {
					this._startTime = time + this._delayTime
				}

				if (this._onRepeatCallback) {
					this._onRepeatCallback(this._object)
				}

				this._onEveryStartCallbackFired = false

				return true
			} else {
				if (this._onCompleteCallback) {
					this._onCompleteCallback(this._object)
				}

				for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					this._chainedTweens[i].start(this._startTime + this._duration)
				}

				this._isPlaying = false

				return false
			}
		}

		return true
	}

	private _updateProperties(
		_object: UnknownProps,
		_valuesStart: UnknownProps,
		_valuesEnd: UnknownProps,
		value: number,
	): void {
		for (const property in _valuesEnd) {
			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue
			}

			const start = _valuesStart[property] || 0
			let end = _valuesEnd[property]
			const startIsArray = Array.isArray(_object[property])
			const endIsArray = Array.isArray(end)
			const isInterpolationList = !startIsArray && endIsArray

			if (isInterpolationList) {
				_object[property] = this._interpolationFunction(end as Array<number>, value)
			} else if (typeof end === 'object' && end) {
				// eslint-disable-next-line
				// @ts-ignore FIXME?
				this._updateProperties(_object[property], start, end, value)
			} else {
				// Parses relative end values with start as base (e.g.: +10, -3)
				end = this._handleRelativeValue(start as number, end as number | string)

				// Protect against non numeric properties.
				if (typeof end === 'number') {
					// eslint-disable-next-line
					// @ts-ignore FIXME?
					_object[property] = start + (end - start) * value
				}
			}
		}
	}

	private _handleRelativeValue(start: number, end: number | string): number {
		if (typeof end !== 'string') {
			return end
		}

		if (end.charAt(0) === '+' || end.charAt(0) === '-') {
			return start + parseFloat(end)
		} else {
			return parseFloat(end)
		}
	}

	private _swapEndStartRepeatValues(property: string): void {
		const tmp = this._valuesStartRepeat[property]
		const endValue = this._valuesEnd[property]

		if (typeof endValue === 'string') {
			this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue)
		} else {
			this._valuesStartRepeat[property] = this._valuesEnd[property]
		}

		this._valuesEnd[property] = tmp
	}
}
