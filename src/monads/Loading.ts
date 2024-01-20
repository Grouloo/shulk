import { union } from './Union'

/**
 * The State monad is useful when working with reactive components, like in a ReactJS app
 * State lets us handle data loading and error handling in a much clearer way
 */
export type Loading<FailedType, DoneType> =
	| { _state: 'Pending' }
	| { val: FailedType; _state: 'Failed' }
	| { val: DoneType; _state: 'Done' }

const Loading = union<{
	Pending: { val: undefined }
	Failed: { val: any }
	Done: { val: any }
}>()

export function Pending(): Loading<never, never> {
	return Loading.Pending({ val: undefined })
}

export function Failed<T>(err: T): Loading<T, never> {
	return Loading.Failed({ val: err })
}

export function Done<T>(val: T): Loading<never, T> {
	return Loading.Done({ val })
}
