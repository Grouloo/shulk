export class MatchNumber<T extends number> {
	constructor(protected input: T) {}

	with<Output>(lookup: Lookup<Output>): Output {
		if (this.input in lookup) {
			return lookup[this.input] as Output
		} else {
			for (const key of Object.keys(lookup)) {
				if (typeof key == 'string' && key.includes('..')) {
					const [min, max] = key.split('..')

					if (
						parseFloat(min) <= this.input &&
						this.input <= parseFloat(max)
					) {
						return Reflect.get(lookup, key) as Output
					}
				}
			}

			return lookup._otherwise
		}
	}

	case<Output>(lookup: LookupFn<Output>): Output {
		const fn = lookup[this.input]

		if (this.input in lookup && typeof fn == 'function') {
			return fn(this.input as never) as Output
		} else {
			for (const key of Object.keys(lookup)) {
				if (typeof key == 'string' && key.includes('..')) {
					const [min, max] = key.split('..')

					if (
						parseFloat(min) <= this.input &&
						this.input <= parseFloat(max)
					) {
						return Reflect.get(lookup, key)(this.input) as Output
					}
				}
			}

			return lookup._otherwise(this.input)
		}
	}

	returnType<Output>() {
		const caseFn = this.case<Output>

		return { input: this.input, case: caseFn }
	}
}

export type Lookup<Output> = {
	[x in number | `${number}..${number}`]?: Output
} & {
	_otherwise: Output
}

export type Handler<T, Output = unknown> = (val: T) => Output

export type LookupFn<Output> = {
	[x in number | `${number}..${number}`]?: Handler<x, Output>
} & {
	_otherwise: Handler<number, Output>
}
