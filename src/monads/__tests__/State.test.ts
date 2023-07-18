import { expect, it, describe } from '@jest/globals'
import state from '../State'
import match from '../../instructions/match'
import { Struct } from '../Struct'

const Television = state<{
	On: Struct<{ currentChannel: number }>
	Off: Struct<{}>
}>()

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
