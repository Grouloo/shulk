export type Prettify<T> = { [x in keyof T]: T[x] } & {}
export type KeyOfUnion<T> = T extends any ? keyof T : never
