export type KeyOfUnion<T> = T extends any ? keyof T : never
