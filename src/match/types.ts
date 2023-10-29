export type Lookup<T extends string | number, Output> =
	| {
			[x in T]: Output
	  }
	| ({
			[x in T]?: Output
	  } & {
			_otherwise: Output
	  })

export type Handler<T, Output = unknown> = (val: T) => Output

export type LookupFn<T extends string | number, Output> =
	| {
			[x in T]: Handler<x, Output>
	  }
	| ({
			[x in T]?: Handler<x, Output>
	  } & {
			_otherwise: Handler<T, Output>
	  })
