import match from '../instructions/match'

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
	 * Returns true if Result has an Ok state
	 * When true, the TS compiler will know val has an OkType
	 * @returns
	 */
	isOk(): this is Result<never, OkType> {
		return this._state === 'Ok'
	}

	/**
	 * Returns true if Result has an Err state
	 * When true, the TS compiler will know val has an Errtype
	 * @returns
	 */
	isErr(): this is Result<ErrType, never> {
		return this._state === 'Err'
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
