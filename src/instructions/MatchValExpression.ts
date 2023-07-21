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

	case<Output>(lookup: LookupFn<typeof this.input, unknown>): Output {
		if (this.input in lookup && typeof lookup[this.input] == 'function') {
			return (lookup[this.input] as Handler<T>)(this.input) as Output
		}

		if ('_otherwise' in lookup) {
			return lookup._otherwise(this.input) as Output
		}

		throw Error('Value did not match with anything.')
	}
}
