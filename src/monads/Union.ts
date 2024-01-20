export type Tags = {
	[x: string]: any
}

type Prettify<T> = { [x in keyof T]: T[x] } & {}

export type TagUnion<T extends Tags> = {
	[x in keyof T]: (
		val: T[x],
	) => T[x] extends object
		? Prettify<
				{ readonly [k in keyof T[x]]: T[x][k] } & { readonly _state: x }
		  >
		: { readonly val: T[x]; readonly _state: x }
}

export type InferUnion<T extends { [x: string]: (val: any) => unknown }> = {
	[k in keyof T]: ReturnType<T[k]>
} & { any: ReturnType<T[keyof T]> }

export function union<T extends Tags>(): TagUnion<T> {
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
	) as TagUnion<T>
}
