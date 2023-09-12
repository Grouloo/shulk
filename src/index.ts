/* eslint-disable import/first */
import match from './instructions/match'

export { match }

import { Result, Ok, Err, AsyncResult } from './monads/Result'
export { Result, Ok, Err, AsyncResult }

import { Maybe, Some, None, AsyncMaybe } from './monads/Maybe'
export { Maybe, Some, None, AsyncMaybe }

import { Loading, Pending, Failed, Done } from './monads/Loading'
export { Loading, Pending, Failed, Done }

import { Tuple, tuple } from './monads/Tuple'
export { Tuple, tuple }

import { state, State } from './monads/State'
export { state, State }

import { resultify, asyncResultify } from './wrappers/resultify'
export { resultify, asyncResultify }

import { maybify, asyncMaybify } from './wrappers/maybify'
export { maybify, asyncMaybify }

import isObject from './typecheck/isObject'
import isState from './typecheck/isState'
export { isObject, isState }
