import { InferUnion, TagUnion, union } from '../monads/Union'

export function isState<
	T extends InferUnion<TagUnion<any>>,
	S extends T['_state'],
>(val: T, state: S): val is T {
	return val._state === state
}
