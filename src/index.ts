/* eslint-disable import/first */
import match from './instructions/match'

export { match }

import { Result, Ok, Err } from './monads/Result'
export { Result, Ok, Err }

import { Maybe, Some, None } from './monads/Maybe'
export { Maybe, Some, None }

import { Tuple, tuple } from './monads/Tuple'
export { Tuple, tuple }

import { state } from './monads/State'
export { state }

import isObject from './typecheck/isObject'
import isState from './typecheck/isState'
export { isObject, isState }
