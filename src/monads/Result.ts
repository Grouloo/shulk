import match from '../instructions/match'
import { Maybe, None, Some } from './Maybe'

interface ResultMethod<ErrType, OkType> {
	/**
	 * Returns true if Result has an Ok state
	 * When true, the TS compiler will know val has an OkType
	 * @returns
	 */
	isOk(): this is Result<never, OkType>

	/**
	 * Returns true if Result has an Err state
	 * When true, the TS compiler will know val has an Errtype
	 * @returns
	 */
	isErr(): this is Result<ErrType, never>

	/**
	 * Throws ErrType if Result has an Err state
	 * @returns
	 */
	unwrap(): OkType

	/**
	 * Throws the message if Result has an Err state
	 * @returns
	 */
	expect(message: string): OkType

	/**
	 * Returns the OkType or the parameter
	 * @param otherwise
	 * @returns
	 */
	unwrapOr<T>(otherwise: T): OkType | T

	/**
	 * Transforms the Result into a Maybe monad with:
	 * -Err translating to the None state
	 * -Ok translating to the Some state
	 */
	toMaybe(): Maybe<OkType>
}

type OkState<OkType> = { val: OkType; _state: 'Ok' }
type ErrState<ErrType> = { val: ErrType; _state: 'Err' }
export type Result<ErrType, OkType> = (ErrState<ErrType> | OkState<OkType>) &
	ResultMethod<ErrType, OkType>

class ResultImpl<ErrType, OkType> implements ResultMethod<ErrType, OkType> {
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

	isOk(): this is Result<never, OkType> {
		return this._state === 'Ok'
	}

	isErr(): this is Result<ErrType, never> {
		return this._state === 'Err'
	}

	unwrap(): OkType {
		return match(this as Result<ErrType, OkType>)
			.returnType<OkType>()
			.case({
				Err: (res) => {
					throw res.val
				},
				Ok: ({ val }) => val,
			})
	}

	expect(message: string): OkType {
		return match(this as Result<ErrType, OkType>)
			.returnType<OkType>()
			.case({
				Err: () => {
					throw message
				},
				Ok: ({ val }) => val,
			})
	}

	unwrapOr<T>(otherwise: T): OkType | T {
		return match(this as Result<ErrType, OkType>)
			.returnType<OkType | T>()
			.case({
				Err: () => otherwise,
				Ok: ({ val }) => val,
			})
	}

	toMaybe(): Maybe<OkType> {
		if (this.isOk()) {
			return Some(this.val)
		}
		return None()
	}
}

export const Err = <ErrType>(err: ErrType): Result<ErrType, never> => {
	return ResultImpl.Err(err) as Result<ErrType, never>
}

export const Ok = <OkType>(val: OkType): Result<never, OkType> => {
	return ResultImpl.Ok(val) as Result<never, OkType>
}

export type AsyncResult<ErrType, OkType> = Promise<Result<ErrType, OkType>>
