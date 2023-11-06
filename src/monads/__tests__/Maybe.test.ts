import { expect, test, describe } from 'bun:test'
import { Maybe, None, Some } from '../Maybe'
import match from '../../match/match'

const HERE_WE_GO = 'here we go'

function doSomething(returnSome: boolean): Maybe<string> {
	if (returnSome) {
		return Some(HERE_WE_GO)
	}
	return None()
}

test('Using Some() returns a Some state wrapping provided value', () => {
	const maybe = Some('foo')

	expect(maybe._state).toBe('Some')
	expect(maybe.unwrapOr(false)).toBe('foo')
})

test('Using None() returns a None state', () => {
	expect(None()._state).toBe('None')
})

describe('.unwrap()', () => {
	test('unwraps the value when monad is in Some state', () => {
		expect(doSomething(true).unwrap()).toBe(HERE_WE_GO)
	})

	test('throws when monad is in None state', () => {
		expect(() => doSomething(false).unwrap()).toThrow()
	})
})

describe('.expect()', () => {
	test('unwraps the value when monad is in Some state', () => {
		expect(doSomething(true).expect('found None')).toBe(HERE_WE_GO)
	})

	test('throws the provided message when monad is in None state', () => {
		expect(() => doSomething(false).expect('found None')).toThrow(
			'found None',
		)
	})
})

describe('.unwrapOr()', () => {
	test('unwraps the value when monad is in Some state', () => {
		expect(doSomething(true).unwrapOr('found None')).toBe(HERE_WE_GO)
	})

	test('returns the provided value instead when monad is in None state', () => {
		expect(doSomething(false).unwrapOr('found None')).toBe('found None')
	})
})

describe('.map()', () => {
	test('executes the provided handler when monad is in Some state', () => {
		const mapped = doSomething(true).map((val) => val.toUpperCase())

		expect(mapped._state).toBe('Some')
		expect(mapped.unwrap()).toBe(HERE_WE_GO.toUpperCase())
	})

	test('does not execute the handler when monad is in None state', () => {
		const mapped = doSomething(false).map((val) => val.toUpperCase())

		expect(mapped._state).toBe('None')
	})
})

describe('.flatMap()', () => {
	test('returns the new monad when original monad is in Some state', () => {
		const mapped = doSomething(true).flatMap((val) => Some(val.toUpperCase()))

		expect(mapped._state).toBe('Some')
		expect(mapped.unwrap()).toBe(HERE_WE_GO.toUpperCase())
	})

	test('does not execute the handler when the original monad is in None state', () => {
		const mapped = doSomething(false).flatMap((val) =>
			Some(val.toUpperCase()),
		)

		expect(mapped._state).toBe('None')
	})
})

describe('.toResult()', () => {
	test('converts the monad to Result.Ok when it is in Some state', () => {
		const mapped = doSomething(true).toResult(() => Error('Oh no'))

		expect(mapped._state).toBe('Ok')
		expect(mapped.val).toBe(HERE_WE_GO)
	})

	test('converts the monad to Result.Err, using provided value, when it is in None state', () => {
		const mapped = doSomething(false).toResult(() => Error('Oh no'))

		expect(mapped._state).toBe('Err')
		expect(mapped.val).toBeInstanceOf(Error)
	})
})

describe('match Maybe tests', () => {
	function matchMaybe(maybe: Maybe<string>) {
		return match(maybe).case({
			None: () => null,
			Some: ({ val }) => val.concat(' again'),
		})
	}

	test('should return "here we go again"', () => {
		expect(matchMaybe(doSomething(true))).toBe(HERE_WE_GO.concat(' again'))
	})

	test('should return null', () => {
		expect(matchMaybe(doSomething(false))).toBe(null)
	})
})
