import isState from '../typecheck/isState'
import { MatchState, stateobj } from './MatchState'
import { MatchVal } from './MatchVal'

export default function match<T extends string | number | stateobj>(
	input: T,
): T extends number | string
	? MatchVal<T>
	: T extends stateobj
	? MatchState<T>
	: never {
	if (isState(input)) {
		return new MatchState(input) as any
	}
	return new MatchVal(input) as any
}
