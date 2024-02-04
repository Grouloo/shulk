import { AsyncResult, Err, Ok, Result } from '../monads/Result'

type Handler<E, O> = () => AsyncResult<E, O>

export class Coroutines<Err, const Ok extends Array<any>> {
	private constructor(protected handlers: Handler<Err, Ok[keyof Ok]>[]) {}

	static run<E, O>(fn: Handler<E, O>): Coroutines<E, [O]> {
		return new this([fn])
	}

	and<E, O>(fn: Handler<E, O>): Coroutines<Err | E, [...Ok, O]> {
		// @ts-expect-error
		return new Coroutines<Err | E, [...Ok, O]>([...this.handlers, fn])
	}

	async end(): AsyncResult<Err, Ok> {
		const results = await Promise.all(this.handlers.map((fn) => fn()))

		// @ts-expect-error
		return results.reduce((prev, current): Result<Err, Ok> => {
			if (current._state === 'Err') {
				return Err(current.val)
			} else if (prev._state == 'Err') {
				return Err(prev.val)
			} else {
				// @ts-expect-error
				return Ok([...prev.val, current.val])
			}
		}, Ok([]))
	}
}
