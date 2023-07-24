import { state } from './State'

type MaybeMethods<T> = {
	/**
	 * Throws if Maybe has a None state
	 * @returns
	 */
	unwrap: () => T
	/**
	 * Throws the message if Maybe has a None state
	 * @returns
	 */
	expect: (message: string) => T
	/**
	 * Returns the Some type or the parameter
	 * @param otherwise
	 * @returns
	 */
	unwrapOr: (otherwise: unknown) => T | typeof otherwise
}

export type RawMaybe<T> = { val: T; _state: 'Some' } | { _state: 'None' }

export type Maybe<T = any> = RawMaybe<T> & MaybeMethods<T>

const MaybeImpl = state<{
	None: {}
	Some: { val: any }
}>()

function unwrap<T>(maybe: RawMaybe<T>): T {
	if (maybe._state == 'Some') {
		return maybe.val
	}
	throw new Error('Maybe is None')
}

function expect<T>(maybe: RawMaybe<T>, message: string) {
	if (maybe._state == 'Some') {
		return maybe.val
	}
	throw message
}

function unwrapOr<T>(
	maybe: RawMaybe<T>,
	otherwise: unknown,
): T | typeof otherwise {
	if (maybe._state == 'Some') {
		return maybe.val
	}
	return otherwise
}

export function None(): Maybe {
	const impl = MaybeImpl.None({})

	return {
		...impl,
		unwrap: () => unwrap(impl),
		expect: (message: string) => expect(impl, message),
		unwrapOr: (otherwise: unknown) => unwrapOr(impl, otherwise),
	}
}

export function Some<T>(val: T) {
	const impl = MaybeImpl.Some({ val })

	return {
		...impl,
		unwrap: () => unwrap(impl),
		expect: (message: string) => expect(impl, message),
		unwrapOr: (otherwise: unknown) => unwrapOr(impl, otherwise),
	}
}
