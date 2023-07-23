import { describe, it, expect } from '@jest/globals'
import match from '../match'

enum Emotion {
	HAPPY,
	SAD,
	ANGRY,
	SURPRISED,
	SCARED,
}

function emotion2smiley(emotion: Emotion) {
	return match(emotion).with({
		[Emotion.HAPPY]: ':D',
		[Emotion.SAD]: ':(',
		[Emotion.ANGRY]: '>:(',
		_otherwise: '???',
	})
}

function emotionIndex(emotion: Emotion): string | null {
	// const res = match(emotion)
	// 	.when.case(Emotion.HAPPY, (val) => `Index for happy is ${val}`)
	// 	.exhaustive()

	// return res
	return match(emotion).case({
		[Emotion.HAPPY]: (val) => `Index for happy is ${val}`,
		[Emotion.SAD]: (val) => `Index for sad is ${val}`,
		_otherwise: () => null,
	})
}

describe('with Statement related tests', () => {
	it('should return ":D" when HAPPY', () => {
		expect(emotion2smiley(Emotion.HAPPY)).toBe(':D')
	})

	it('should return ":(" when SAD', () => {
		expect(emotion2smiley(Emotion.SAD)).toBe(':(')
	})

	it('should return "???" when not implemented', () => {
		expect(emotion2smiley(Emotion.SURPRISED)).toBe('???')
	})
})

describe('case Statement related tests', () => {
	it('should return right index when HAPPY', () => {
		expect(emotionIndex(Emotion.HAPPY)).toBe(
			`Index for happy is ${Emotion.HAPPY}`,
		)
	})

	it('should return right index" when SAD', () => {
		expect(emotionIndex(Emotion.SAD)).toBe(`Index for sad is ${Emotion.SAD}`)
	})

	it('should return null when not implemented', () => {
		expect(emotionIndex(Emotion.SURPRISED)).toBeNull()
	})
})

// describe('State match related tests', () => {
//     const EmotionnalState = state<{
//         Hopeful: Struct<{}>
//         Despaired: Struct<{}>
//     }>()

//     function commentState(emotionnalState: {_state: string}){
//         match(emotionnalState).case({

//         })
//     }

//     it('should', () => {

//     })
// })
