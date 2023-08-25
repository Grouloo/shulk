/* eslint-disable import/first */
import match from './instructions/match'

export { match }

import { Result, Ok, Err, AsyncResult } from './monads/Result'
export { Result, Ok, Err, AsyncResult }

import { Maybe, Some, None } from './monads/Maybe'
export { Maybe, Some, None }

import { Loading, Pending, Failed, Done } from './monads/Loading'
export { Loading, Pending, Failed, Done }

import { Tuple, tuple } from './monads/Tuple'
export { Tuple, tuple }

import { state, State } from './monads/State'
export { state, State }

import { resultify } from './wrappers/resultify'
export { resultify }

import { maybify } from './wrappers/maybify'
export { maybify }

import { $defMacro } from './instructions/defMacro'
export { $defMacro }

import isObject from './typecheck/isObject'
import isState from './typecheck/isState'
export { isObject, isState }
