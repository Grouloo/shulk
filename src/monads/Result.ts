const INVALID_WRAPPED_VALUE = 'Invalid wrapped value'

export class Result<Err, Succ> {
	constructor(
		public isSuccess: boolean,
		protected failure: Err | undefined,
		protected success: Succ | undefined,
	) {}

	match<T, P>({
		failure,
		success,
	}: {
		failure: (val: Err) => T
		success: (val: Succ) => P
	}) {
		if (!this.isSuccess && this.failure !== undefined) {
			return failure(this.failure)
		}

		if (this.isSuccess && this.success !== undefined) {
			return success(this.success)
		}

		throw Error(INVALID_WRAPPED_VALUE)
	}

	unwrap(): Succ {
		return this.match({
			failure(err) {
				throw err
			},
			success: (val) => val,
		})
	}

	safeUnwrap(): Err | Succ {
		return this.match({
			failure: (err) => err,
			success: (val) => val,
		})
	}

	unwrapOr<T>(otherwise: T) {
		return this.match({
			failure: () => otherwise,
			success: (val) => val,
		})
	}
}

export const failure = <L>(val: L): Result<L, never> => {
	return new Result<L, never>(false, val, undefined)
}

export const success = <R>(val: R): Result<never, R> => {
	return new Result<never, R>(true, undefined, val)
}

export type PromisedResult<Err, Succ> = Promise<Result<Err, Succ>>
