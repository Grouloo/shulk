import match from '../match/match'
import { Err, Ok, Result } from './Result'
import { InferUnion, union } from './Union'

type Prettify<T> = { [x in keyof T]: T[x] } & {}

const RawMaybe = union<{ None: {}; Some: { val: any } }>()
type RawMaybe = InferUnion<typeof RawMaybe>

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
		 * Returns a new Maybe monad in Ok state if the condition is verified, and a new Monad in Err state otherwise
		 * @param checker
		 * @param otherwise
		 */
		filter(checker: (val: T) => boolean): Maybe<T>

		/**
		 * Returns a new Maybe monad in Ok state if the condition is verified, and a new Monad in Err state otherwise
		 * @param checker
		 * @param otherwise
		 */
		filterType<O extends T>(checker: (val: T) => val is O): Maybe<O>

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

		filter(checker: (val: T) => boolean): Maybe<T> {
			return match(self)
				.returnType<Maybe<T>>()
				.case({
					None: () => None(),
					Some: ({ val }) => {
						if (checker(val)) {
							return Some(val)
						} else {
							return None()
						}
					},
				})
		},

		filterType<O extends T>(checker: (val: T) => val is O): Maybe<O> {
			return match(self)
				.returnType<Maybe<O>>()
				.case({
					None: () => None(),
					Some: ({ val }) => {
						if (checker(val)) {
							return Some(val)
						} else {
							return None()
						}
					},
				})
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
