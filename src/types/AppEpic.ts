import { AppState } from './AppState'
import { Epic } from 'redux-observable'
import { AppActions } from './AppActions'
import { Dependencies } from './Dependencies'

export type AppEpic = Epic<AppActions, AppActions, AppState, Dependencies>
