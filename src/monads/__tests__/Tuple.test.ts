import { expect, test } from '@jest/globals'
import { tuple } from '../Tuple'

test('tuple creation', () => {
	const myTuple = tuple('noah', 'mio')

	expect(myTuple).toEqual(['noah', 'mio'])
})

test('tuple decomposition', () => {
	const [noah, mio] = tuple('noah', 'mio')

	expect(noah).toBe('noah')
	expect(mio).toBe('mio')
})
