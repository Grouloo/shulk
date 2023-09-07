import { expect, it, describe } from 'bun:test'
import { State, state } from '../State'

const Television = state<{
	On: { currentChannel: number }
	Off: {}
}>()
type Television = State<typeof Television>

function tvFactory(isOn: boolean) {
	if (isOn) {
		return Television.On({ currentChannel: 1 })
	}

	return Television.Off({})
}

describe('Instantiation tests', () => {
	it('should instantiate a Television with On Struct', () => {
		const tv = Television.On({ currentChannel: 12 })

		expect(tv._state).toBe('On')
		expect(tv.currentChannel).toBe(12)
	})

	it('should instantiate a Television with Off Struct', () => {
		const tv = Television.Off({})

		expect(tv._state).toBe('Off')
	})
})

describe('Single value states', () => {
	const Billboard = state<{
		Off: void
		On: string
	}>()

	it('should instantiate On state', () => {
		const coca = Billboard.On('Coca-cola')

		expect(coca.val).toBe('Coca-cola')
		expect(coca._state).toBe('On')
	})
})
