import { Prettify } from '../types'
import { State, state, StatesRes } from './State'

const RawMaybe = state<{ None: {}; Some: { val: any } }>()

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
	}
}

export function None(): Maybe<never> {
	return createMaybe('None')
}

export function Some<T>(val: T): Maybe<T> {
	return createMaybe<T>('Some', val)
}

export type AsyncMaybe<T> = Promise<Maybe<T>>
