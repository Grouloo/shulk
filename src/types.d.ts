export type KeyOfUnion<T> = T extends any ? keyof T : never
export type Prettify<T> = { [x in keyof T]: T[x] } & {}
