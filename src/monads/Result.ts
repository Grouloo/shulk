import State from './State'
import { Struct } from './Struct'

const INVALID_WRAPPED_VALUE = 'Invalid wrapped value'

type Failure<ErrType> = { val: ErrType }
type Success<OkType> = { val: OkType }
export type Result<ErrType, OkType> = {
	val: ErrType | OkType
	_state: 'Ok' | 'Err'
}

// export const ResultImpl = State<{
// 	Failure: <ErrType>(obj: { val: ErrType }) => Failure<ErrType>
// 	Success: <OkType>(obj: { val: OkType }) => Success<OkType>
// }>()

export const ResultImpl = State<{
	Err: Struct<{ val: any }>
	Ok: Struct<{ val: any }>
}>()

export function unwrap<ErrType, OkType>(
	result: Result<ErrType, OkType>,
): OkType {
	return ResultImpl.match(result).case({
		Err: () => {
			throw result.val as ErrType
		},
		Ok: () => result.val as OkType,
	})
}

export function unwrapOrElse<ErrType, OkType, T>(
	result: Result<ErrType, OkType>,
	orElse: T,
): OkType | T {
	return ResultImpl.match(result).case({
		Err: () => orElse,
		Ok: () => result.val as OkType,
	})
}

export const Err = <ErrType>(err: ErrType): Result<ErrType, never> =>
	ResultImpl.Err({ val: err })

export const Ok = <OkType>(val: OkType): Result<never, OkType> =>
	ResultImpl.Ok({ val })
