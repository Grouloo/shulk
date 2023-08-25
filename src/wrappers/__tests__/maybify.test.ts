import { test, expect, describe } from '@jest/globals'
import { maybify } from '../maybify'

function divide(dividend: number, divisor: number): number | null {
	if (divisor == 0) {
		return null
	}
	return dividend / divisor
}

function barIfFoo(input: string) {
	if (input == 'foo') {
		return 'bar'
	}
}

const safeSqrt = maybify(Math.sqrt)
const safeDivide = maybify(divide)
const safeBarIfFoo = maybify(barIfFoo)

describe('undefined related tests', () => {
	test('should return Some state', () => {
		const result = safeBarIfFoo('foo')

		expect(result._state).toBe('Some')
		expect(result.unwrap()).toBe('bar')
	})

	test('should return None state', () => {
		const result = safeBarIfFoo('oh no!')

		expect(result._state).toBe('None')
		expect(() => result.unwrap()).toThrow()
	})
})

describe('null related tests', () => {
	test('should return Some state', () => {
		const result = safeDivide(2, 2)

		expect(result._state).toBe('Some')
		expect(result.unwrap()).toBe(1)
	})

	test('should return None state', () => {
		const result = safeDivide(2, 0)

		expect(result._state).toBe('None')
		expect(() => result.unwrap()).toThrow()
	})
})

describe('NaN related tests', () => {
	test('should return Some state', () => {
		const result = safeSqrt(1)

		expect(result._state).toBe('Some')
		expect(result.unwrap()).toBe(1)
	})

	test('should return None state', () => {
		const result = safeSqrt(-1)

		expect(result._state).toBe('None')
		expect(() => result.unwrap()).toThrow()
	})
})
