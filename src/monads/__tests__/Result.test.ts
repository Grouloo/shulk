import { expect, it, describe } from 'bun:test'
import { Err, Result, Ok } from '../Result'
import match from '../../instructions/match'

const CANNOT_DIVIDE = 'Cannot divide number by 0.'

const FAILED = divide(2, 0)
const SUCCESS = divide(2, 2)

function divide(dividend: number, divisor: number): Result<Error, number> {
	if (divisor == 0) {
		return Err(Error(CANNOT_DIVIDE))
	}
	return Ok(dividend / divisor)
}

describe('Success and Failure functions tests', () => {
	it('should return a Success', () => {
		const result = divide(2, 2)

		expect(result._state).toBe('Ok')
	})

	it('should return a Failure', () => {
		const result = divide(2, 0)

		expect(result._state).toBe('Err')
	})
})

describe('unwrap tests', () => {
	it('should unwrap Result when Ok state', () => {
		expect(SUCCESS.unwrap()).toBe(1)
	})

	it('should throw when unwrapping Err state', () => {
		expect(() => FAILED.unwrap()).toThrow(CANNOT_DIVIDE)
	})
})

describe('unwrapOr tests', () => {
	const NAN = 'Not a number'

	it('should unwrap Result when Ok state', () => {
		expect(SUCCESS.unwrapOr(NAN)).toBe(1)
	})

	it('should return the otherwise when unwrapping Err state', () => {
		expect(FAILED.unwrapOr(NAN)).toBe(NAN)
	})
})

describe('expect tests', () => {
	const EXPECTED = 'Expected a number that is not 0'

	it('should unwrap Result when Ok state', () => {
		expect(SUCCESS.expect(EXPECTED)).toBe(1)
	})

	it('should return the otherwise when unwrapping Err state', () => {
		expect(() => FAILED.expect(EXPECTED)).toThrow(EXPECTED)
	})
})

describe('isOK tests', () => {
	it('should return true', () => {
		expect(SUCCESS.isOk()).toBe(true)
	})

	it('should return false', () => {
		expect(FAILED.isOk()).toBe(false)
	})
})

describe('isErr tests', () => {
	it('should return false', () => {
		expect(SUCCESS.isErr()).toBe(false)
	})

	it('should return true', () => {
		expect(FAILED.isErr()).toBe(true)
	})
})

describe('toMaybe tests', () => {
	it('should translate to a Some Maybe', () => {
		const maybe = SUCCESS.toMaybe()

		expect(maybe._state).toBe('Some')
		expect(maybe.unwrap()).toBe(1)
	})

	it('should translate to a None Maybe', () => {
		expect(FAILED.toMaybe()).toHaveProperty('_state', 'None')
	})
})

describe('map tests', () => {
	it('should return a string', () => {
		const mapped = SUCCESS.map((val) => val.toString())

		expect(mapped._state).toBe('Ok')
		expect(mapped.val).toBe('1')
	})

	it('should return an Error', () => {
		const mapped = FAILED.map((val) => val.toString())

		expect(mapped._state).toBe('Err')
		expect(mapped.val).toBeInstanceOf(Error)
	})
})

describe('flatMap tests', () => {
	it('should return a string', () => {
		const mapped = SUCCESS.flatMap((val) => Ok(val.toString()))

		expect(mapped._state).toBe('Ok')
		expect(mapped.val).toBe('1')
	})

	it('should return an Error', () => {
		const mapped = FAILED.flatMap((val) => Ok(val.toString()))

		expect(mapped._state).toBe('Err')
		expect(mapped.val).toBeInstanceOf(Error)
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

	it('it should handle Ok path', () => {
		const msg = matchDivision(SUCCESS)

		expect(msg).toBe(SUCCESS.val)
	})

	it('it should handle Err path', () => {
		const msg = matchDivision(FAILED)

		expect(msg).toBe(HANDLED_ERR)
	})
})
