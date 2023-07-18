export type Struct<Q extends {}> = (obj: Q) => Q & { _state: string }

export default function struct<T>(obj: T): T {
	return obj
}
