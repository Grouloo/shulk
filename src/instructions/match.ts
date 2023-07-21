import isState from '../typecheck/isState'
import { MatchStateExpression, stateobj } from './MatchStateExpression'
import { MatchValExpression } from './MatchValExpression'

export default function match<T extends string | number | stateobj>(
	input: T,
): T extends number | string
	? MatchValExpression<T>
	: T extends stateobj
	? MatchStateExpression<T>
	: never {
	if (isState(input)) {
		return new MatchStateExpression(input) as any
	}
	return new MatchValExpression(input) as any
}
