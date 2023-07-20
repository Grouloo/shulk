import state from '../monads/State'
import { Struct } from '../monads/Struct'

export default function match<T extends string | number | symbol>(
	statement: T,
) {
	return new MatchStatement(statement)
}

type Unmatched = { _state: 'Unmatched' }
type Matched<T> = { val: T; _state: 'Matched' }
const MatchState = state<{
	Unmatched: Struct<{}>
	Matched: Struct<{ val: unknown }>
}>()

export class MatchStatement<T extends string | number | symbol> {
	when: CaseStatement<T>

	constructor(protected input: T) {
		this.when = new CaseStatement(input, MatchState.Unmatched({}))
	}

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

class CaseStatement<In, Out = null> {
	constructor(
		protected input: In,
		protected matchState: Unmatched | Matched<Out>,
	) {}

	case(
		predicate: In,
		handler: (val: typeof predicate) => unknown,
	): CaseStatement<In, Out> {
		if (this.input == predicate) {
			const val = handler(this.input)

			return new CaseStatement<In, Out & typeof val>(
				this.input,
				MatchState.Matched({ val }) as Matched<Out>,
			)
		}

		return new CaseStatement(this.input, MatchState.Unmatched({}))
	}

	exhaustive(): Out {
		if (this.matchState._state == 'Unmatched') {
			throw Error('Match-Case statement not exhaustive.')
		}

		return this.matchState.val
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
