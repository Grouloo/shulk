export default (val: unknown): val is object =>
	typeof val === 'object' && !Array.isArray(val)
