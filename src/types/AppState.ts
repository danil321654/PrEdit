import * as reducers from '../reducers'
import { combineReducers } from 'redux'
const rootReducer = combineReducers(reducers)

export type AppState = ReturnType<typeof rootReducer>
