import { assert } from 'chai'
import { AppEpic } from '../types'
import { TestScheduler } from 'rxjs/testing'

interface TestHelperProps {
  epic: AppEpic
  input: [string, Record<string, any>]
  output: [string, Record<string, any>]
  dependencies?: (cold: any) => any
  state$: any
}

export function testSchedulerRun({
  epic,
  input,
  output,
  dependencies,
  state$,
}: TestHelperProps) {
  const testScheduler = new TestScheduler((actual, expected) => {
    assert.deepEqual(actual, expected)
  })
  testScheduler.run(({ hot, cold, expectObservable }) => {
    const action$ = hot(...input)
    const output$ = epic(action$ as any, state$, dependencies?.(cold))
    expectObservable(output$).toBe(...output)
  })
}
