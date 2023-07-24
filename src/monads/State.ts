type State = {
	[x: string]: any
}

type StateRes<T extends State> = {
	[x in keyof T]: (
		val: T[x],
	) => T[x] extends object ? T[x] & { _state: x } : { val: T[x]; _state: x }
}

export function state<T extends State>(): StateRes<T> {
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
	) as StateRes<T>
}
