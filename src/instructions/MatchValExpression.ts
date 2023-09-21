import { Lookup, LookupFn } from './types'

export class MatchValExpression<T extends string | number> {
	constructor(protected input: T) {}

	with<Output>(lookup: Lookup<T, Output>): Output {
		if (this.input in lookup) {
			return lookup[this.input] as Output
		}

		if ('_otherwise' in lookup) {
			return lookup._otherwise
		}

		throw Error('Value did not match with anything.')
	}

	case<Output>(lookup: LookupFn<T, Output>): Output {
		const fn = lookup[this.input]

		if (this.input in lookup && typeof fn == 'function') {
			return fn(this.input as never) as Output
		}

		if ('_otherwise' in lookup) {
			return lookup._otherwise(this.input) as Output
		}

		throw Error('Value did not match with anything.')
	}

	returnType<Output>() {
		const caseFn = this.case<Output>

		return { input: this.input, case: caseFn }
	}
}
