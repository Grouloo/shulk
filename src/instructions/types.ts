type Lookup<T extends string | number, Output> =
	| {
			[x in T]: Output
	  }
	| ({
			[x in T]?: Output
	  } & {
			_otherwise: Output
	  })

type Handler<T, Output = unknown> = (val: T) => Output

type LookupFn<T extends string | number, Output> =
	| {
			[x in T]: Handler<x, Output>
	  }
	| ({
			[x in T]?: Handler<x, Output>
	  } & {
			_otherwise: Handler<T, Output>
	  })
