import { expect, test } from 'bun:test'
import { Procedure } from '../Procedure'
import { Err, Ok } from '../../monads/Result'

test('When running a single routine, must return its result in a Promise', async () => {
	const result = Procedure.start()
		.sequence(async () => Ok('Hello, world!'))
		.end()

	expect(result).toBeInstanceOf(Promise)
	expect((await result).val).toBe('Hello, world!')
})

test('When running a single routine that fails, must return an Err Result in a Promise', async () => {
	const result = Procedure.start()
		.sequence(async () => Err('Goodbye, world!'))
		.end()

	expect(result).toBeInstanceOf(Promise)

	const awaitedRes = await result
	expect(awaitedRes._state).toBe('Err')
	expect(awaitedRes.val).toBe('Goodbye, world!')
})

test("When running routines in sequence, must return the last one's result in a Promise", async () => {
	const result = Procedure.start()
		.sequence(async () => Ok(12))
		.sequence(async (i) => Ok(i + 1))
		.sequence(async (i) => Ok(i.toString()))
		.end()

	expect(result).toBeInstanceOf(Promise)
	expect((await result).val).toBe('13')
})

test('When running routines in parallel, must return Ok results in an array', async () => {
	const result = Procedure.start()
		.parallelize<never, string[]>(
			async () => Ok('bonjour'),
			async () => Ok('adios'),
		)
		.end()

	expect(result).toBeInstanceOf(Promise)
	expect((await result).val).toEqual(['bonjour', 'adios'])
})

test('When running routines in parallel and one fail, must return Err result', async () => {
	const result = Procedure.start()
		.parallelize<string, string[]>(
			async () => Ok('adios'),
			async () => Err('surprise'),
		)
		.end()

	expect(result).toBeInstanceOf(Promise)
	const awaitedRes = await result
	expect(awaitedRes._state).toEqual('Err')
	expect(awaitedRes.val).toEqual('surprise')
})
