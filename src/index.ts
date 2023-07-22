import match from './instructions/match'
import { Result, Ok, Err } from './monads/Result'
import state from './monads/State'
import { Struct } from './monads/Struct'
import isObject from './typecheck/isObject'
import isState from './typecheck/isState'

export { match, state, Struct, Result, Ok, Err, isObject, isState }
