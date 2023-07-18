import match from '../instructions/match'
import State from './State'

const INVALID_WRAPPED_VALUE = 'Invalid wrapped value'

type Failure<ErrType> = { val: ErrType; _state: 'Failure' }
type Success<OkType> = { val: OkType; _state: 'Success' }
export type Result<ErrType, OkType> = Failure<ErrType> | Success<OkType>

export const ResultImpl = State<{
	Failure: <ErrType>(obj: { val: ErrType }) => Failure<ErrType>
	Success: <OkType>(obj: { val: OkType }) => Success<OkType>
}>()

export function unwrap<ErrType, OkType>(
	result: Result<ErrType, OkType>,
): OkType {
	return ResultImpl.match(result).case({
		Failure: () => {
			throw result.val as ErrType
		},
		Success: () => result.val as OkType,
	})
}

export function unwrapOrElse<ErrType, OkType, T>(
	result: Result<ErrType, OkType>,
	orElse: T,
): OkType | T {
	return ResultImpl.match(result).case({
		Failure: () => orElse,
		Success: () => result.val as OkType,
	})
}

export const Failure = <ErrType>(err: ErrType): Result<ErrType, never> =>
	ResultImpl.Failure({ val: err })

export const Success = <OkType>(val: OkType): Result<never, OkType> =>
	ResultImpl.Success({ val })
