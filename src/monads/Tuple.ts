export type Tuple<T extends ReadonlyArray<unknown>> = T

export function tuple<T extends Array<unknown>>(...params: T): Tuple<T> {
	return [...params] as Tuple<T>
}
