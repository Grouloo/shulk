import { Maybe, None, Some } from '../monads/Maybe'

export function maybify<T extends (...args: any) => any>(
	fn: T,
): (...params: Parameters<T>) => Maybe<NonNullable<ReturnType<T>>> {
	return (...params: Parameters<T>) => {
		try {
			const res = fn(...(params as Array<any>))

			if (res === null || res === undefined || Number.isNaN(res)) {
				return None()
			}

			return Some(res)
		} catch (e) {
			return None()
		}
	}
}
