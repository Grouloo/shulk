import { state } from '../monads/State'

type Unmatched = { _state: 'Unmatched' }
type Matched<T> = { val: T; _state: 'Matched' }
const MatchState = state<{
	Unmatched: {}
	Matched: { val: unknown }
}>()

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
