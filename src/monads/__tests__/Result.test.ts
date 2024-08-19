import { expect, test, describe } from 'bun:test'
import { Err, Result, Ok } from '../Result'
import match from '../../match/match'

const CANNOT_DIVIDE = 'Cannot divide number by 0.'

const FAILED = divide(2, 0)
const SUCCESS = divide(2, 2)

function divide(dividend: number, divisor: number): Result<Error, number> {
	if (divisor == 0) {
		return Err(Error(CANNOT_DIVIDE))
	}
	return Ok(dividend / divisor)
}

test('Ok() returns a Result in Ok state wrapping the value', () => {
	const result = Ok('foo')

	expect(result.val).toBe('foo')
	expect(result._state).toBe('Ok')
})

test('Err() returns a Result in Err statr wrapping the value', () => {
	const result = Err('bar')

	expect(result.val).toBe('bar')
	expect(result._state).toBe('Err')
})

describe('.unwrap()', () => {
	test('returns the value when monad is in Ok state', () => {
		expect(SUCCESS.unwrap()).toBe(1)
	})

	test('throws when monad is in Err state', () => {
		expect(() => FAILED.unwrap()).toThrow(CANNOT_DIVIDE)
	})
})

describe('.unwrapOr()', () => {
	const NAN = 'Not a number'

	test('returns the value when monad is in Ok state', () => {
		expect(SUCCESS.unwrapOr(NAN)).toBe(1)
	})

	test('returns the provided value when monad is in Err state', () => {
		expect(FAILED.unwrapOr(NAN)).toBe(NAN)
	})
})

describe('.expect()', () => {
	const EXPECTED = 'Expected a number that is not 0'

	test('returns the value when monad is Ok state', () => {
		expect(SUCCESS.expect(EXPECTED)).toBe(1)
	})

	test('throws the provided value when monad is in Err state', () => {
		expect(() => FAILED.expect(EXPECTED)).toThrow(EXPECTED)
	})
})

describe('.isOk()', () => {
	test('returns true when monad is in Ok state', () => {
		expect(SUCCESS.isOk()).toBe(true)
	})

	test('returns false when monad is in Err state', () => {
		expect(FAILED.isOk()).toBe(false)
	})
})

describe('.isErr()', () => {
	test('returns false when monad is in Ok state', () => {
		expect(SUCCESS.isErr()).toBe(false)
	})

	test('returns true when monad is in Err state', () => {
		expect(FAILED.isErr()).toBe(true)
	})
})

describe('.toMaybe()', () => {
	test('converts monad to Maybe.Some when it is in Ok state', () => {
		const maybe = SUCCESS.toMaybe()

		expect(maybe._state).toBe('Some')
		expect(maybe.unwrap()).toBe(1)
	})

	test('converts monad to Maybe.None when it is in Err state', () => {
		expect(FAILED.toMaybe()).toHaveProperty('_state', 'None')
	})
})

describe('.map()', () => {
	test('executes the provided handler when monad is in Ok state', () => {
		const mapped = SUCCESS.map((val) => val.toString())

		expect(mapped._state).toBe('Ok')
		expect(mapped.val).toBe('1')
	})

	test('returns the monad without executing the handler when in Err state', () => {
		const mapped = FAILED.map((val) => val.toString())

		expect(mapped._state).toBe('Err')
		expect(mapped.val).toBeInstanceOf(Error)
	})
})

describe('.mapErr()', () => {
	test('returns the monad without executing the handler when in Ok state', () => {
		const mapped = SUCCESS.mapErr((val) => new TypeError(val.message))

		expect(mapped._state).toBe('Ok')
		expect(mapped.val).toBe(1)
	})

	test('executes the provided handler when monad is in Err state', () => {
		const mapped = FAILED.mapErr((val) => new TypeError(val.message))

		expect(mapped._state).toBe('Err')
		expect(mapped.val).toBeInstanceOf(TypeError)
	})
})

describe('.filter()', () => {
	test('returns the evaluated value when it passes the filter', () => {
		const mapped = SUCCESS.filter(
			(val): val is number => val == 1,
			() => false,
		)

		expect(mapped._state).toBe('Ok')
		expect(mapped.val).toBe(1)
	})

	test(`returns the provided fallback when the value doesn't pass the filter`, () => {
		const mapped = divide(4, 2).filter(
			(val): val is number => val == 1,
			() => false,
		)

		expect(mapped._state).toBe('Err')
		expect(mapped.val).toBe(false)
	})

	test('returns the monad without evaluating anything when it is already in Err state', () => {
		const mapped = FAILED.filter(
			(val): val is number => val == 1,
			() => false,
		)

		expect(mapped._state).toBe('Err')
		expect(mapped.val).toBeInstanceOf(Error)
	})
})

describe('.flatMap()', () => {
	test('executes the handler and returns the new monad when original is in Ok state', () => {
		const mapped = SUCCESS.flatMap((val) => Ok(val.toString()))

		expect(mapped._state).toBe('Ok')
		expect(mapped.val).toBe('1')
	})

	test('does not execute the handler when the monad is already in Err state', () => {
		const mapped = FAILED.flatMap((val) => Ok(val.toString()))

		expect(mapped._state).toBe('Err')
		expect(mapped.val).toBeInstanceOf(Error)
	})
})

describe('.flatMapErr()', () => {
	test('executes the handler and returns the new monad when original is in Err state', () => {
		const mapped = FAILED.flatMapErr((err) => Ok(err))

		expect(mapped._state).toBe('Ok')
		expect(mapped.val).toBeInstanceOf(Error)
	})

	test('does not execute the handler when the monad is already in Ok state', () => {
		const mapped = SUCCESS.flatMapErr((err) => Ok(err))

		expect(mapped._state).toBe('Ok')
		expect(mapped.val).toBe(1)
	})
})

describe('match tests', () => {
	const HANDLED_ERR = 'handled err path'

	function matchDivision(res: Result<Error, number>) {
		return match(res)
			.returnType<string | number>()
			.case({
				Err: () => HANDLED_ERR,
				Ok: ({ val }) => val,
			})
	}

	test('it should handle Ok path', () => {
		const msg = matchDivision(SUCCESS)

		expect(msg).toBe(SUCCESS.val)
	})

	test('it should handle Err path', () => {
		const msg = matchDivision(FAILED)

		expect(msg).toBe(HANDLED_ERR)
	})
})
