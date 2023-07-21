import isObject from './isObject'

export default (val: unknown): val is { _state: string } =>
	isObject(val) && '_state' in val
