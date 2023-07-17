export type Tuple<A, B> = [A, B]

export const tuple = <A, B>(a: A, b: B): Tuple<A, B> => [a, b]
