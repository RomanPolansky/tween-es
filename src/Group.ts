import type Tween from './Tween'
import type { UnknownProps } from './Tween'

/**
 * Controlling groups of tweens
 *
 * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
 * In these cases, you may want to create your own smaller groups of tween
 */
export default class Group {
	public static shared = new Group()

	private _time = 0

	private _tweens: {
		[key: string]: Tween<UnknownProps>
	} = {}

	private _tweensAddedDuringUpdate: {
		[key: string]: Tween<UnknownProps>
	} = {}

	public getTime() {
		return this._time
	}

	public getAll(): Array<Tween<UnknownProps>> {
		return Object.keys(this._tweens).map(tweenId => {
			return this._tweens[tweenId]
		})
	}

	public removeAll(): void {
		this._tweens = {}
	}

	public add(tween: Tween<UnknownProps>): void {
		this._tweens[tween.getId()] = tween
		this._tweensAddedDuringUpdate[tween.getId()] = tween
	}

	public remove(tween: Tween<UnknownProps>): void {
		delete this._tweens[tween.getId()]
		delete this._tweensAddedDuringUpdate[tween.getId()]
	}

	public update(time: number, preserve = false): boolean {
		this._time = time

		let tweenIds = Object.keys(this._tweens)

		if (tweenIds.length === 0) {
			return false
		}

		// Tweens are updated in "batches". If you add a new tween during an
		// update, then the new tween will be updated in the next batch.
		// If you remove a tween during an update, it may or may not be updated.
		// However, if the removed tween was added during the current batch,
		// then it will not be updated.
		while (tweenIds.length > 0) {
			this._tweensAddedDuringUpdate = {}

			for (let i = 0; i < tweenIds.length; i++) {
				const tween = this._tweens[tweenIds[i]]
				const autoStart = !preserve

				if (tween && tween.update(this._time, autoStart) === false && !preserve) {
					delete this._tweens[tweenIds[i]]
				}
			}

			tweenIds = Object.keys(this._tweensAddedDuringUpdate)
		}

		return true
	}
}
