import { describe, expect, it } from '@jest/globals'
import { Err, Result, Ok, unwrap, ResultImpl } from '../Result'

const CANNOT_DIVIDE = 'Cannot divide number by 0.'

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
		const result = divide(2, 2)

		expect(unwrap(result)).toBe(1)
	})

	it('should throw when unwrapping Err state', () => {
		const result = divide(2, 0)

		expect(() => unwrap(result)).toThrow(CANNOT_DIVIDE)
	})
})
