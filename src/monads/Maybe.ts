import { Err, Ok, Result } from './Result'
import { State, state } from './State'

type Prettify<T> = { [x in keyof T]: T[x] } & {}

const RawMaybe = state<{ None: {}; Some: { val: any } }>()
type RawMaybe = State<typeof RawMaybe>

export type Maybe<T> = Prettify<
	({ _state: 'None' } | { val: T; _state: 'Some' }) & {
		/**
		 * Throws if Maybe has a None state
		 * @returns
		 */
		unwrap(): T
		/**
		 * Throws the message if Maybe has a None state
		 * @returns
		 */
		expect(message: string): T
		/**
		 * Returns the Some type or the parameter
		 * @param otherwise
		 * @returns
		 */
		unwrapOr<O>(otherwise: O): T | O

		/**
		 * Returns the value returned by the handler, wrapped in a new Maybe monad
		 * @param handler
		 */
		map<O>(handler: (val: T) => O): Maybe<O>

		/**
		 * Returns the new Maybe monad returned by the handler
		 * @param handler
		 */
		flatMap<O>(handler: (val: T) => Maybe<O>): Maybe<O>

		/**
		 * Returns a Result monad where the Ok state translates to the Some state
		 * The Err state will contain the value passed as an argument
		 * @param err
		 */
		toResult<E>(err: () => E): Result<E, T>
	}
>

function createMaybe<T>(type: 'Some' | 'None', val?: T): Maybe<T> {
	const self = RawMaybe[type]({ val })
	return {
		...self,

		unwrap(): T {
			if (self._state == 'Some') {
				return self.val
			}
			throw new Error('Maybe is None')
		},

		expect(message: string): T {
			if (self._state == 'Some') {
				return self.val
			}
			throw message
		},

		unwrapOr<O>(otherwise: O): T | O {
			if (self._state == 'Some') {
				return self.val
			}
			return otherwise
		},

		map<O>(handler: (val: T) => O): Maybe<O> {
			if (self._state == 'None') {
				return None()
			}

			return Some(handler(self.val))
		},

		flatMap<O>(handler: (val: T) => Maybe<O>): Maybe<O> {
			if (self._state == 'None') {
				return None()
			} else {
				return handler(self.val)
			}
		},

		toResult(err) {
			if (self._state == 'None') {
				return Err(err())
			} else {
				return Ok(self.val)
			}
		},
	}
}

export function None(): Maybe<never> {
	return createMaybe('None')
}

export function Some<T>(val: T): Maybe<T> {
	return createMaybe<T>('Some', val)
}

export type AsyncMaybe<T> = Promise<Maybe<T>>
