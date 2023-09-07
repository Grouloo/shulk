import { expect, test } from 'bun:test'
import { Tuple, tuple } from '../Tuple'

test('tuple creation', () => {
	const myTuple: Tuple<['noah', 'mio']> = tuple('noah', 'mio')

	expect(myTuple).toEqual(['noah', 'mio'])
})

test('tuple decomposition', () => {
	const [noah, mio] = tuple('noah', 'mio')

	expect(noah).toBe('noah')
	expect(mio).toBe('mio')
})
