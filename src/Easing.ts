export type EasingFunction = (amount: number) => number

export const linear: EasingFunction = (amount: number) => amount

export const quadraticIn: EasingFunction = (amount: number) => amount * amount
export const quadraticOut: EasingFunction = (amount: number) => amount * (2 - amount)
export const quadraticInOut: EasingFunction = (amount: number) => {
	if ((amount *= 2) < 1) {
		return 0.5 * amount * amount
	}
	return -0.5 * (--amount * (amount - 2) - 1)
}

export const cubicIn: EasingFunction = (amount: number) => amount * amount * amount
export const cubicOut: EasingFunction = (amount: number) => --amount * amount * amount + 1
export const cubicInOut: EasingFunction = (amount: number) => {
	if ((amount *= 2) < 1) {
		return 0.5 * amount * amount * amount
	}
	return 0.5 * ((amount -= 2) * amount * amount + 2)
}

export const quarticIn: EasingFunction = (amount: number) => amount * amount * amount * amount
export const quarticOut: EasingFunction = (amount: number) => 1 - --amount * amount * amount * amount
export const quarticInOut: EasingFunction = (amount: number) => {
	if ((amount *= 2) < 1) {
		return 0.5 * amount * amount * amount * amount
	}
	return -0.5 * ((amount -= 2) * amount * amount * amount - 2)
}

export const quinticIn: EasingFunction = (amount: number) => amount * amount * amount * amount * amount
export const quinticOut: EasingFunction = (amount: number) => --amount * amount * amount * amount * amount + 1
export const quinticInOut: EasingFunction = (amount: number) => {
	if ((amount *= 2) < 1) {
		return 0.5 * amount * amount * amount * amount * amount
	}
	return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2)
}

export const sinusoidalIn: EasingFunction = (amount: number) => 1 - Math.sin(((1.0 - amount) * Math.PI) / 2)
export const sinusoidalOut: EasingFunction = (amount: number) => Math.sin((amount * Math.PI) / 2)
export const sinusoidalInOut: EasingFunction = (amount: number) => 0.5 * (1 - Math.sin(Math.PI * (0.5 - amount)))

export const exponentialIn: EasingFunction = (amount: number) => amount === 0 ? 0 : Math.pow(1024, amount - 1)
export const exponentialOut: EasingFunction = (amount: number) => amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount)
export const exponentialInOut: EasingFunction = (amount: number) => {
	if (amount === 0) return 0 
	if (amount === 1) return 1
	if ((amount *= 2) < 1) {
		return 0.5 * Math.pow(1024, amount - 1)
	}
	return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2)
}

export const circularIn: EasingFunction = (amount: number) => 1 - Math.sqrt(1 - amount * amount)
export const circularOut: EasingFunction = (amount: number) => Math.sqrt(1 - --amount * amount)
export const circularInOut: EasingFunction = (amount: number) => {
	if ((amount *= 2) < 1) {
		return -0.5 * (Math.sqrt(1 - amount * amount) - 1)
	}
	return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1)
}

export const elasticIn: EasingFunction = (amount: number) => {
	if (amount === 0) return 0
	if (amount === 1) return 1
	return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI)
}
export const elasticOut: EasingFunction = (amount: number) => {
	if (amount === 0) return 0
	if (amount === 1) return 1
	return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1
}
export const elasticInOut: EasingFunction = (amount: number) => {
	if (amount === 0) return 0
	if (amount === 1) return 1
	amount *= 2
	if (amount < 1) {
		return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI)
	}
	return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1
}

export const backIn: EasingFunction = (amount: number) => {
	const s = 1.70158
	return amount === 1 ? 1 : amount * amount * ((s + 1) * amount - s)
}
export const backOut: EasingFunction = (amount: number) => {
	const s = 1.70158
	return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1
}
export const backInOut: EasingFunction = (amount: number) => {
	const s = 1.70158 * 1.525
	if ((amount *= 2) < 1) {
		return 0.5 * (amount * amount * ((s + 1) * amount - s))
	}
	return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2)
}

export const bounceIn: EasingFunction = (amount: number) => 1 - bounceOut(1 - amount)
export const bounceOut: EasingFunction = (amount: number) => {
	if (amount < 1 / 2.75) {
		return 7.5625 * amount * amount
	} else if (amount < 2 / 2.75) {
		return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75
	} else if (amount < 2.5 / 2.75) {
		return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375
	} else {
		return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375
	}
}
export const bounceInOut: EasingFunction = (amount: number) => {
	if (amount < 0.5) {
		return bounceIn(amount * 2) * 0.5
	}
	return bounceOut(amount * 2 - 1) * 0.5 + 0.5
}

export default {
	linear,
	quadraticIn,
	quadraticOut,
	quadraticInOut,
	cubicIn,
	cubicOut,
	cubicInOut,
	quarticIn,
	quarticOut,
	quarticInOut,
	quinticIn,
	quinticOut,
	quinticInOut,
	sinusoidalIn,
	sinusoidalOut,
	sinusoidalInOut,
	exponentialIn,
	exponentialOut,
	exponentialInOut,
	circularIn,
	circularOut,
	circularInOut,
	elasticIn,
	elasticOut,
	elasticInOut,
	backIn,
	backOut,
	backInOut,
	bounceIn,
	bounceOut,
	bounceInOut
}
