import { describe, expect, it } from '@jest/globals'
import { Failure, Result, Success } from '../Result'

function divide(dividend: number, divisor: number): Result<Error, number> {
	if (divisor == 0) {
		return Failure(Error('Cannot divide number by 0.'))
	}
	return Success(dividend / divisor)
}

describe('Success and Failure functions tests', () => {
	it('should return a Success', () => {
		const result = divide(2, 2)

		expect(result._state).toBe('Success')
	})

	it('should return a Failure', () => {
		const result = divide(2, 0)

		expect(result._state).toBe('Failure')
	})
})
