import match from '../match/match'
import { Maybe, None, Some } from './Maybe'
import { Err, Ok, Result } from './Result'
import { union } from './Union'

type Prettify<T> = { [x in keyof T]: T[x] } & {}

interface LoadingMethod<FailedType, DoneType> {
	map<T>(fn: (val: DoneType) => T): Loading<FailedType, T>

	toMaybe(): Maybe<DoneType>

	toResult(): Result<FailedType, DoneType | undefined>
}

class LoadingImpl<FailedType, DoneType>
	implements LoadingMethod<FailedType, DoneType>
{
	private constructor(
		public val: undefined | FailedType | DoneType,
		public _state: 'Pending' | 'Failed' | 'Done',
	) {}

	static Pending() {
		return new this(undefined, 'Pending')
	}

	static Failed<T>(err: T) {
		return new this(err, 'Failed')
	}

	static Done<T>(val: T) {
		return new this(val, 'Done')
	}

	map<T>(fn: (val: DoneType) => T): Loading<FailedType, T> {
		return match(this as Loading<FailedType, DoneType>)
			.returnType<Loading<FailedType, T>>()
			.case({
				Pending: () => Pending(),
				Failed: ({ val }) => Failed(val),
				Done: ({ val }) => Done(fn(val)),
			})
	}

	toMaybe(): Maybe<DoneType> {
		return match(this as Loading<FailedType, DoneType>)
			.returnType<Maybe<DoneType>>()
			.case({
				Pending: () => None(),
				Failed: ({ val }) => None(),
				Done: ({ val }) => Some(val),
			})
	}

	toResult(): Result<FailedType, DoneType | undefined> {
		return match(this as Loading<FailedType, DoneType>)
			.returnType<Result<FailedType, DoneType | undefined>>()
			.case({
				Pending: () => Ok(undefined),
				Failed: ({ val }) => Err(val),
				Done: ({ val }) => Ok(val),
			})
	}
}

type PendingState = { _state: 'Pending' }
type FailedState<T> = { val: T; _state: 'Failed' }
type DoneState<T> = { val: T; _state: 'Done' }

/**
 * The Loading monad is useful when working with reactive components, like in a ReactJS app
 * State lets us handle data loading and error handling in a much clearer way
 */
export type Loading<FailedType, DoneType> = Prettify<
	(PendingState | FailedState<FailedType> | DoneState<DoneType>) &
		LoadingMethod<FailedType, DoneType>
>

const Loading = union<{
	Pending: { val: undefined }
	Failed: { val: any }
	Done: { val: any }
}>()

export function Pending(): Loading<never, never> {
	return LoadingImpl.Pending() as Loading<never, never>
}

export function Failed<T>(err: T): Loading<T, never> {
	return LoadingImpl.Failed(err) as Loading<T, never>
}

export function Done<T>(val: T): Loading<never, T> {
	return LoadingImpl.Done(val) as Loading<never, T>
}
