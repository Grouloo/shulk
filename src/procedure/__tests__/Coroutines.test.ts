import { expect, test } from 'bun:test'
import { Coroutines } from '../Coroutines'
import { Err, Ok } from '../../monads/Result'

test('When running a single routine, must return its result in a Promise', async () => {
	const result = Coroutines.run(async () => Ok('Hello, world!')).end()

	expect(result).toBeInstanceOf(Promise)
	expect((await result).val).toEqual(['Hello, world!'])
})

test('When running a single routine that fails, must return an Err Result in a Promise', async () => {
	const result = Coroutines.run(async () => Err('Goodbye, world!')).end()

	expect(result).toBeInstanceOf(Promise)

	const awaitedRes = await result
	expect(awaitedRes._state).toBe('Err')
	expect(awaitedRes.val).toBe('Goodbye, world!')
})

test('When running routines in parallel, must return Ok results in an array', async () => {
	// Type must be AsyncResult<never, [string, string]>
	const result = Coroutines.run(async () => Ok('bonjour'))
		.and(async () => Ok('adios'))
		.end()

	expect(result).toBeInstanceOf(Promise)
	expect((await result).val).toEqual(['bonjour', 'adios'])
})

test('When running routines in parallel and one fail, must return Err result', async () => {
	// Type must be AsyncResult<string, string[]>
	const result = Coroutines.run(async () => Ok('adios'))
		.and(async () => Err('surprise'))
		.end()

	expect(result).toBeInstanceOf(Promise)
	const awaitedRes = await result
	expect(awaitedRes._state).toEqual('Err')
	expect(awaitedRes.val).toEqual('surprise')
})
