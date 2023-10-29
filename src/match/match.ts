import isState from '../typecheck/isState'
import { MatchNumber } from './MatchNumber'
import { MatchState, stateobj } from './MatchState'
import { MatchVal } from './MatchVal'

export default function match<T extends string | number | stateobj>(
	input: T,
): T extends number
	? MatchNumber<T>
	: T extends string
	? MatchVal<T>
	: T extends stateobj
	? MatchState<T>
	: never {
	if (typeof input == 'number') {
		return new MatchNumber(input) as any
	} else if (isState(input)) {
		return new MatchState(input) as any
	} else {
		return new MatchVal(input) as any
	}
}
