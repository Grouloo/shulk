import State from './State'
import { Struct } from './Struct'

const INVALID_WRAPPED_VALUE = 'Invalid wrapped value'

// type Failure<ErrType> = { val: ErrType }
// type Success<OkType> = { val: OkType }

type RawResult<ErrType, OkType> = {
	val: ErrType | OkType
	_state: 'Ok' | 'Err'
}

export type Result<ErrType, OkType> = RawResult<ErrType, OkType> & {
	unwrap: () => OkType
	unwrapOr: <T>(otherwise: T) => OkType | T
	expect: (message: string) => OkType
}

export const ResultImpl = State<{
	Err: Struct<{ val: any }>
	Ok: Struct<{ val: any }>
}>()

function unwrap<ErrType, OkType>(result: RawResult<ErrType, OkType>): OkType {
	return ResultImpl.match(result).case({
		Err: () => {
			throw result.val as ErrType
		},
		Ok: () => result.val as OkType,
	})
}

function unwrapOr<ErrType, OkType, T>(
	result: RawResult<ErrType, OkType>,
	orElse: T,
): OkType | T {
	return ResultImpl.match(result).case({
		Err: () => orElse,
		Ok: () => result.val as OkType,
	})
}

function expect<ErrType, OkType>(
	result: RawResult<ErrType, OkType>,
	message: string,
): OkType {
	return ResultImpl.match(result).case({
		Err: () => {
			throw message
		},
		Ok: () => result.val as OkType,
	})
}

export const Err = <ErrType>(err: ErrType): Result<ErrType, never> => {
	const impl = ResultImpl.Err({ val: err })

	return {
		...impl,
		unwrap: () => unwrap<ErrType, never>(impl),
		unwrapOr: (otherwise) => unwrapOr(impl, otherwise),
		expect: (message) => expect<ErrType, never>(impl, message),
	}
}

export const Ok = <OkType>(val: OkType): Result<never, OkType> => {
	const impl = ResultImpl.Ok({ val })

	return {
		...impl,
		unwrap: () => unwrap<never, OkType>(impl),
		unwrapOr: (otherwise) => unwrapOr(impl, otherwise),
		expect: (message) => expect<never, OkType>(impl, message),
	}
}
