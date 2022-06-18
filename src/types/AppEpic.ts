import { AppState } from './AppState'
import { Epic } from 'redux-observable'
import { Dependencies } from './Dependencies'
import { Action } from 'redux'

export type AppEpic = Epic<Action<undefined>,Action<undefined> , AppState, Dependencies>
