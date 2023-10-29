import { AsyncResult, Err, Ok } from '../monads/Result'

type Handler<Input, Err, Ok> = (val: Input) => AsyncResult<Err, Ok>

type Instructions<Input, Err, Ok> = (
	| Handler<Input, Err, Ok>
	| Handler<Input, Err, Ok>[]
)[]

export class Procedure<Err = never, Input = never> {
	constructor(private instructions: Instructions<Input, Err, Input>) {}

	static start() {
		return new this([])
	}

	sequence<E, O>(fn: Handler<Input, E, O>) {
		return new Procedure<Err | E, O>([...this.instructions, fn] as any)
	}

	parallelize<E, O>(...fn: Handler<Input, E, O[keyof O]>[]) {
		return new Procedure<Err | E, O>([...this.instructions, fn] as any)
	}

	async end(): AsyncResult<Err, Input> {
		let prevResult: any = undefined

		for (const seq of this.instructions) {
			if (Array.isArray(seq)) {
				const coroutines = seq.map((par) => par(prevResult))

				const results = await Promise.all(coroutines)

				prevResult = []

				for (const result of results) {
					if (result._state == 'Err') {
						return Err(result.val)
					} else {
						prevResult.push(result.val)
					}
				}
			} else {
				const result = await seq(prevResult)

				if (result._state == 'Err') {
					return Err(result.val)
				} else {
					prevResult = result.val
				}
			}
		}

		return Ok(prevResult)
	}
}
