type PropsType = { [x: string]: unknown }

interface MethodsType<SelfType> {
	[x: string]: (self: SelfType, ...args: never) => unknown
}

type MacroLookup<
	PropsArg extends PropsType,
	MethodsArg extends MethodsType<PropsArg>,
> = {
	props: PropsArg
	methods: MethodsArg
}

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

export function $defMacro<
	ConstArg extends PropsType,
	MethodsArg extends MethodsType<ConstArg>,
>(
	lookup: MacroLookup<ConstArg, MethodsArg>,
): {
	readonly [x in keyof (typeof lookup)['props']]: (typeof lookup)['props'][x]
} & {
	[x in keyof (typeof lookup)['methods']]: (
		...args: DropFirst<Parameters<(typeof lookup)['methods'][x]>>
	) => ReturnType<(typeof lookup)['methods'][x]>
} {
	return new Proxy(lookup, {
		get: (target, property: string, handle) => {
			if (property in target.methods) {
				return (...args: never) => target.methods[property](handle, ...args)
			}
			return target.props[property]
		},
		set: (target, property: string, newValue, _handle) => {
			if (property in target.methods) {
				return false
			}

			target.props = { ...target.props, [property]: newValue }
			return true
		},
	}) as any
}
