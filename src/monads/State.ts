import match, { MatchStatement } from '../instructions/match'
import struct, { Struct } from './Struct'

type State = {
	[x: string]: Struct<any>
}

type StateRes<T extends State> = {
	[x in keyof T]: Struct<ReturnType<T[x]>, { _state: x }>
}

type StructInstance<StateKey> = { _state: StateKey }

export default function state<T extends State>(): StateRes<T> & {
	match: (obj: StructInstance<keyof T>) => MatchStatement<keyof T>
} {
	return new Proxy(
		{},
		{
			//@ts-ignore
			get(
				_target,
				prop: keyof T,
				_receiver, //: //| ((obj: StructInstance<keyof T>) => MatchStatement<keyof T>) //| ((obj: T[typeof prop]) => T[typeof prop] & { _state: string }) {
			) {
				if (prop == 'match') {
					return (obj: StructInstance<keyof T>) => matchState(obj)
				}

				return (obj: T[typeof prop]) => ({ ...obj, _state: prop })
			},
		},
	) as StateRes<T> & {
		match: (obj: StructInstance<keyof T>) => MatchStatement<keyof T>
	}
}

function matchState<T>(obj: StructInstance<keyof T>) {
	return match(obj._state)
}
