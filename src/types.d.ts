export type Prettify<T> = { [x in keyof T]: T[x] } & {}
