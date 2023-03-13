export { default as Easing } from './Easing'
export { default as Interpolation } from './Interpolation'

export { default as Group } from './Group'
export { default as Tween } from './Tween'
export { default as Now } from './Now'

import Sequence from './Sequence'
import { mainGroup } from './mainGroup'

export const nextId = Sequence.nextId
export const TWEEN = mainGroup
