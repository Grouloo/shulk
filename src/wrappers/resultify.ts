import { Err, Ok, Result } from '../monads/Result'

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
