import match from '../instructions/match'
import State from './State'
import { Struct } from './Struct'

const INVALID_WRAPPED_VALUE = 'Invalid wrapped value'

// type Failure<ErrType> = { val: ErrType }
// type Success<OkType> = { val: OkType }

type RawResult<ErrType, OkType> = {
	val: ErrType | OkType
	_state: 'Ok' | 'Err'
}

interface ResultMethods<ErrType, OkType> {
	/**
	 * Throws ErrType if Result has an Err state
	 * @returns
	 */
	unwrap: () => OkType
	/**
	 * Throws the message if Result has an Err state
	 * @returns
	 */
	expect: (message: string) => OkType
	/**
	 * Returns the OkType or the parameter
	 * @param otherwise
	 * @returns
	 */
	unwrapOr: <T>(otherwise: T) => OkType | T
}

export type Result<ErrType, OkType> = RawResult<ErrType, OkType> &
	ResultMethods<ErrType, OkType>

export const ResultImpl = State<{
	Err: Struct<{ val: any }>
	Ok: Struct<{ val: any }>
}>()

function unwrap<ErrType, OkType>(result: RawResult<ErrType, OkType>): OkType {
	return match(result).case({
		Err: (res) => {
			throw res.val
		},
		Ok: (res) => res.val,
	})
}

function unwrapOr<ErrType, OkType, T>(
	result: RawResult<ErrType, OkType>,
	orElse: T,
): OkType | T {
	return match(result).case({
		Err: () => orElse,
		Ok: () => result.val as OkType,
	})
}

function expect<ErrType, OkType>(
	result: RawResult<ErrType, OkType>,
	message: string,
): OkType {
	return match(result).case({
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
