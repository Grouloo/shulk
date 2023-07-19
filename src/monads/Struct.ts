export type Struct<Q extends {}, S extends {} = {}> = (obj: Q) => Q & S

export default function struct<T>(obj: T): T {
	return obj
}
