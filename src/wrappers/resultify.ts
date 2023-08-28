import { AsyncResult, Err, Ok, Result } from '../monads/Result'

export function resultify<E extends unknown, T extends (...args: any) => any>(
	fn: T,
): (...params: Parameters<T>) => Result<E, ReturnType<T>> {
	return (...params: Parameters<T>) => {
		try {
			const res = fn(...(params as Array<any>))
			return Ok(res)
		} catch (e) {
			return Err(e as E)
		}
	}
}

export function asyncResultify<
	E extends unknown,
	T extends (...args: any) => Promise<any>,
>(fn: T): (...params: Parameters<T>) => AsyncResult<E, Awaited<ReturnType<T>>> {
	return async (...params: Parameters<T>) => {
		try {
			const res = await fn(...(params as Array<any>))
			return Ok(res)
		} catch (e) {
			return Err(e as E)
		}
	}
}
