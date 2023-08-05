type States = {
	[x: string]: any
}

type StatesRes<T extends States> = {
	readonly [x in keyof T]: (
		val: T[x],
	) => T[x] extends object
		? Readonly<T[x] & { _state: x }>
		: Readonly<{ val: T[x]; _state: x }>
}

export type State<T extends StatesRes<States>> = ReturnType<T[keyof T]>

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
