import { test, expect, it, describe } from '@jest/globals'
import { asyncResultify, resultify } from '../resultify'

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

describe('async tests', () => {
	async function saysAsync(): Promise<string> {
		return 'I am async'
	}

	const safeSaysAsync = asyncResultify(saysAsync)

	it('should return a Promise', async () => {
		expect(safeSaysAsync()).toBeInstanceOf(Promise)
	})

	it('should return a string', async () => {
		expect((await safeSaysAsync()).unwrap()).toBe('I am async')
	})
})
