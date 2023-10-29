import match from '../match/match'
import { Done, Failed, Loading } from './Loading'
import { Maybe, None, Some } from './Maybe'

type Prettify<T> = { [x in keyof T]: T[x] } & {}

interface ResultMethod<ErrType, OkType> {
	/**
	 * Returns true if Result has an Ok state
	 * When true, the TS compiler will know val is of OkType
	 * @returns
	 */
	isOk(): this is Result<never, OkType>

	/**
	 * Returns true if Result has an Err state
	 * When true, the TS compiler will know val is of ErrType
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

	/**
	 * Transforms the Result into a Loading monad with:
	 * -Err translating to the Failed state
	 * -Ok translating to the Done state
	 */
	toLoading(): Loading<ErrType, OkType>

	/**
	 * Returns a new Result monad with the result of the handler as the Ok value
	 * @param handler
	 */
	map<O>(handler: (val: OkType) => O): Result<ErrType, O>

	/**
	 * Returns a new Result monad with the result of the handler as the Err value
	 * @param handler
	 */
	mapErr<E>(handler: (val: ErrType) => E): Result<E, OkType>

	/**
	 * Returns the new Result monad returned by the handler
	 * @param handler
	 */
	flatMap<E, O>(handler: (val: OkType) => Result<E, O>): Result<E | ErrType, O>

	/**
	 * Returns the new Result monad wrapped in a Promise returned by the handler
	 * @param handler
	 */
	flatMapAsync<E, O>(
		handler: (val: OkType) => AsyncResult<E, O>,
	): AsyncResult<E | ErrType, O>

	/**
	 * Returns a new Monad result in Ok state if the condition is verified
	 * Returns a new Monad in Err state if not
	 * @param checker
	 * @param otherwise
	 */
	filter<E, O extends OkType>(
		checker: (val: OkType) => val is O,
		otherwise: (val: OkType) => E,
	): Result<E | ErrType, O>
}

type OkState<OkType> = { val: OkType; _state: 'Ok' }
type ErrState<ErrType> = { val: ErrType; _state: 'Err' }
export type Result<ErrType, OkType> = Prettify<
	(ErrState<ErrType> | OkState<OkType>) & ResultMethod<ErrType, OkType>
>

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
		} else {
			return None()
		}
	}

	toLoading(): Loading<ErrType, OkType> {
		return match(this as Result<ErrType, OkType>)
			.returnType<Loading<ErrType, OkType>>()
			.case({
				Err: ({ val }) => Failed(val),
				Ok: ({ val }) => Done(val),
			})
	}

	map<O>(handler: (val: OkType) => O): Result<ErrType, O> {
		return match(this as Result<ErrType, OkType>)
			.returnType<Result<ErrType, O>>()
			.case({
				Err: (result) => Err(result.val),
				Ok: ({ val }) => Ok(handler(val)),
			})
	}

	mapErr<E>(handler: (val: ErrType) => E): Result<E, OkType> {
		return match(this as Result<ErrType, OkType>)
			.returnType<Result<E, OkType>>()
			.case({
				Err: ({ val }) => Err(handler(val)),
				Ok: ({ val }) => Ok(val),
			})
	}

	flatMap<E, O>(
		handler: (val: OkType) => Result<E, O>,
	): Result<E | ErrType, O> {
		return match(this as Result<ErrType, OkType>)
			.returnType<Result<E | ErrType, O>>()
			.case({
				Err: (result) => Err(result.val),
				Ok: ({ val }) => handler(val),
			})
	}

	flatMapAsync<E, O>(
		handler: (val: OkType) => AsyncResult<E, O>,
	): AsyncResult<E | ErrType, O> {
		return match(this as Result<ErrType, OkType>)
			.returnType<AsyncResult<E | ErrType, O>>()
			.case({
				Err: async (result) => Err(result.val),
				Ok: async ({ val }) => await handler(val),
			})
	}

	filter<E, O extends OkType>(
		checker: (val: OkType) => val is O,
		otherwise: (val: OkType) => E,
	): Result<E | ErrType, O> {
		return match(this as Result<ErrType, OkType>)
			.returnType<Result<E | ErrType, O>>()
			.case({
				Err: (result) => Err(result.val),
				Ok: ({ val }) => {
					if (checker(val)) {
						return Ok(val)
					} else {
						return Err(otherwise(val))
					}
				},
			})
	}
}

export const Err = <ErrType>(err: ErrType): Result<ErrType, never> => {
	return ResultImpl.Err(err) as Result<ErrType, never>
}

export const Ok = <OkType>(val: OkType): Result<never, OkType> => {
	return ResultImpl.Ok(val) as Result<never, OkType>
}

export type AsyncResult<ErrType, OkType> = Promise<Result<ErrType, OkType>>
