// import * as epics from "../epics";
import { map } from 'lodash-es'
import { BehaviorSubject } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { rootReducer } from './rootReducer'
import { AppState, Dependencies } from '../types'
import { createStore, applyMiddleware, compose, Store, Action } from 'redux'
import {
  createEpicMiddleware,
  ActionsObservable,
  StateObservable,
  combineEpics,
} from 'redux-observable'

let composeEnhancers = compose

export interface StoreInstance extends Store<AppState, Action<any>> {
  epic$: BehaviorSubject<any>
}

let storeInstance: StoreInstance

export function configureStore(
  dependencies: Dependencies,
  initialState?: Partial<AppState>
) {
  if (!storeInstance) {
    if (
      process.env.NODE_ENV === 'development' &&
      window &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ) {
      composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
        name: 'PrintForm',
      })
    }

    const epicMiddleware = createEpicMiddleware<
      Action<any>,
      Action<any>,
      AppState,
      Dependencies
    >({ dependencies })

    const middleware = [epicMiddleware]

    const enhancer = composeEnhancers(applyMiddleware(...middleware))

    storeInstance = {
      ...createStore(rootReducer, initialState, enhancer),
      epic$: new BehaviorSubject(combineEpics(...map([]))),
    } as StoreInstance

    const rootEpic = (
      action$: ActionsObservable<Action<any>>,
      state$: StateObservable<AppState>,
      deps: Dependencies
    ) =>
      storeInstance.epic$.pipe(mergeMap((epic) => epic(action$, state$, deps)))

    epicMiddleware.run(rootEpic as any)
  }
  return storeInstance
}
