import { Handler, Lookup } from './types'

export type stateobj = { _state: string }

export class MatchStateExpression<T extends stateobj> {
	constructor(protected input: T) {}

	with<Output>(lookup: Lookup<T['_state'], Output>): Output {
		if (this.input._state in lookup) {
			return lookup[this.input._state as T['_state']] as Output
		}

		if ('_otherwise' in lookup) {
			return lookup._otherwise
		}

		throw Error('Value did not match with anything.')
	}

	case<Output>(lookup: LookupStateFn<T, Output>): Output {
		if (
			this.input._state in lookup &&
			typeof lookup[this.input._state as T['_state']] == 'function'
		) {
			return (
				lookup[this.input._state as T['_state']] as Handler<
					typeof this.input,
					Output
				>
			)(this.input)
		}

		if ('_otherwise' in lookup) {
			return lookup._otherwise(this.input) as Output
		}

		throw Error('Value did not match with anything.')
	}

	returnType<Output>() {
		const caseFn = this.case<Output>

		return { input: this.input, case: caseFn }
	}
}

type LookupStateFn<T extends stateobj, Output> =
	| {
			[x in T['_state']]: Handler<T, Output>
	  }
	| ({
			[x in T['_state']]?: Handler<T, Output>
	  } & {
			_otherwise: Handler<T, Output>
	  })
