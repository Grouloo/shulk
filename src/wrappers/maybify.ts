import { AsyncMaybe, Maybe, None, Some } from '../monads/Maybe'

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

export function asyncMaybify<T extends (...args: any) => Promise<any>>(
	fn: T,
): (...params: Parameters<T>) => AsyncMaybe<NonNullable<ReturnType<T>>> {
	return async (...params: Parameters<T>) => {
		try {
			const res = await fn(...(params as Array<any>))

			if (res === null || res === undefined || Number.isNaN(res)) {
				return None()
			}

			return Some(res)
		} catch (e) {
			return None()
		}
	}
}
