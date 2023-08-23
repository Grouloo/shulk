import { test, expect } from '@jest/globals'
import { resultify } from '../resultify'

function divide(dividend: number, divisor: number): number {
	if (divisor == 0) {
		throw Error('Cannot divide by 0')
	}
	return dividend / divisor
}

const safeDivide = resultify<Error, typeof divide>(divide)

test('should return Ok state', () => {
	const result = safeDivide(2, 2)

	expect(result._state).toBe('Ok')
	expect(result.val).toBe(1)
})

test('should return Err state', () => {
	const result = safeDivide(2, 0)

	expect(result._state).toBe('Err')
	expect(result.val).toBeInstanceOf(Error)
})
