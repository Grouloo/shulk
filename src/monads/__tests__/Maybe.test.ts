import { expect, it, describe } from 'bun:test'
import { Maybe, None, Some } from '../Maybe'
import match from '../../instructions/match'

const HERE_WE_GO = 'here we go'

function doSomething(returnSome: boolean): Maybe<string> {
	if (returnSome) {
		return Some(HERE_WE_GO)
	}
	return None()
}

it('should be Some state', () => {
	expect(doSomething(true)._state).toBe('Some')
})

it('should be None state', () => {
	expect(doSomething(false)._state).toBe('None')
})

describe('unwrap method tests', () => {
	it('should unwrap Maybe', () => {
		expect(doSomething(true).unwrap()).toBe(HERE_WE_GO)
	})

	it('should throw', () => {
		expect(() => doSomething(false).unwrap()).toThrow()
	})
})

describe('expect method tests', () => {
	it('should unwrap Maybe', () => {
		expect(doSomething(true).expect('found None')).toBe(HERE_WE_GO)
	})

	it('should throw', () => {
		expect(() => doSomething(false).expect('found None')).toThrow(
			'found None',
		)
	})
})

describe('unwrapOr method tests', () => {
	it('should unwrap Maybe', () => {
		expect(doSomething(true).unwrapOr('found None')).toBe(HERE_WE_GO)
	})

	it('should throw', () => {
		expect(doSomething(false).unwrapOr('found None')).toBe('found None')
	})
})

describe('match Maybe tests', () => {
	function matchMaybe(maybe: Maybe<string>) {
		return match(maybe).case({
			None: () => null,
			Some: ({ val }) => val.concat(' again'),
		})
	}

	it('should return "here we go again"', () => {
		expect(matchMaybe(doSomething(true))).toBe(HERE_WE_GO.concat(' again'))
	})

	it('should return null', () => {
		expect(matchMaybe(doSomething(false))).toBe(null)
	})
})
