import match from '../instructions/match'
import { state } from './State'

const INVALID_WRAPPED_VALUE = 'Invalid wrapped value'

type RawResult<ErrType, OkType> =
	| {
			val: ErrType
			_state: 'Err'
	  }
	| { val: OkType; _state: 'Ok' }

interface ResultMethods<ErrType, OkType> {}

export class Result<ErrType, OkType> {
	private constructor(
		public val: ErrType | OkType,
		public _state: 'Ok' | 'Err',
	) {}

	static Err<ErrType>(val: ErrType) {
		return new this<ErrType, never>(val, 'Err')
	}

	static Ok<OkType>(val: OkType) {
		return new this<never, OkType>(val, 'Ok')
	}

	/**
	 * Throws ErrType if Result has an Err state
	 * @returns
	 */
	unwrap(): OkType {
		return match(this).case({
			Err: (res) => {
				throw res.val
			},
			Ok: (res) => res.val,
		})
	}
	/**
	 * Throws the message if Result has an Err state
	 * @returns
	 */
	expect(message: string): OkType {
		return match(this).case({
			Err: () => {
				throw message
			},
			Ok: () => this.val as OkType,
		})
	}
	/**
	 * Returns the OkType or the parameter
	 * @param otherwise
	 * @returns
	 */
	unwrapOr<T>(otherwise: T): OkType | T {
		return match(this).case({
			Err: () => otherwise,
			Ok: ({ val }) => val,
		})
	}
}

export const Err = <ErrType>(err: ErrType): Result<ErrType, never> => {
	return Result.Err(err)
}

export const Ok = <OkType>(val: OkType): Result<never, OkType> => {
	return Result.Ok(val)
}
