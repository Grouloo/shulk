import { State, StatesRes, state } from '../monads/State'

export function isState<T extends State<StatesRes<any>>, S extends T['_state']>(
	val: T,
	state: S,
): val is T {
	return val._state === state
}

const Cat = state<{
	Alive: { hungry: boolean }
	Dead: {}
}>()
type Cat = State<typeof Cat>

function vroum(cat: Cat) {
	if (isState(cat, 'Alive')) {
		cat
	}
}
