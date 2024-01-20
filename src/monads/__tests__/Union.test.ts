import { expect, test, describe } from 'bun:test'
import { InferUnion, union } from '../Union'

const Television = union<{
	On: { currentChannel: number }
	Off: {}
}>()
type Television = InferUnion<typeof Television>

describe('Instantiating Television will', () => {
	test("return a Television['On'] type when calling Television.On", () => {
		const tv = Television.On({ currentChannel: 12 })

		expect(tv._state).toBe('On')
		expect(tv.currentChannel).toBe(12)
	})

	test("return a Television['Off'] type when calling Television.Off", () => {
		const tv = Television.Off({})

		expect(tv._state).toBe('Off')
	})
})

describe('Instantiating a single-value state will', () => {
	const Billboard = union<{
		Off: void
		On: string
	}>()

	test("wrap the provided value in a 'val' property", () => {
		const coca = Billboard.On('Coca-cola')

		expect(coca.val).toBe('Coca-cola')
		expect(coca._state).toBe('On')
	})
})
