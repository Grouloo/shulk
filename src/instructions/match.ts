export default function match<T extends string | number | symbol>(
	statement: T,
) {
	return new MatchStatement(statement)
}

export class MatchStatement<T extends string | number | symbol> {
	constructor(protected input: T) {}

	with<Output>(
		lookup: ExhaustiveLookupVal<T, Output> | OtherwiseLookupVal<T, Output>,
	): Output {
		if (this.input in lookup) {
			return lookup[this.input] as Output
		}

		if ('otherwise' in lookup) {
			return lookup.otherwise
		}

		throw Error('Value did not match with anything.')
	}

	case<Output>(
		lookup: ExhaustiveLookupFn<T, unknown> | OtherwiseLookupFn<T, unknown>,
	): Output {
		if (this.input in lookup && typeof lookup[this.input] == 'function') {
			return (lookup[this.input] as Handler<T>)(this.input) as Output
		}

		if ('otherwise' in lookup) {
			return lookup.otherwise(this.input) as Output
		}

		throw Error('Value did not match with anything.')
	}
}

type ExhaustiveLookupVal<T extends string | number | symbol, Output> = {
	[x in T]: Output
}

type OtherwiseLookupVal<T extends string | number | symbol, Output> = {
	[x in T]?: Output
} & {
	otherwise: Output
}

type Handler<T, Output = unknown> = (val: T) => Output

type ExhaustiveLookupFn<T extends string | number | symbol, Output> = {
	[x in T]: Handler<x>
}

type OtherwiseLookupFn<T extends string | number | symbol, Output> = {
	[x in T]?: Handler<x>
} & {
	otherwise: Handler<T>
}
