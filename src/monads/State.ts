import { Prettify } from '../types'

export type States = {
	[x: string]: any
}

export type StatesRes<T extends States> = {
	[x in keyof T]: (
		val: T[x],
	) => T[x] extends object
		? Readonly<T[x] & { _state: x }>
		: Readonly<{ val: T[x]; _state: x }>
}

export type State<T extends { [x: string]: (val: any) => unknown }> = {
	[k in keyof T]: ReturnType<T[k]>
} & { any: ReturnType<T[keyof T]> }

type AllStates<T extends StatesRes<States>> = ReturnType<T[keyof T]>

// export type All<T extends State> =

export function state<T extends States>(): StatesRes<T> {
	return new Proxy(
		{},
		{
			//@ts-ignore
			get(_target, prop: keyof T, _receiver) {
				return (obj: T[typeof prop]) => {
					if (typeof obj === 'object') {
						return { ...obj, _state: prop }
					}
					return { val: obj, _state: prop }
				}
			},
		},
	) as StatesRes<T>
}
