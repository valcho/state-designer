import { S, createState } from '@state-designer/core'
import * as React from 'react'

const emptyArray: unknown[] = []

/* -------------------------------------------------- */
/*                     React Hook                     */
/* -------------------------------------------------- */

/**
 * Subscribe a component to an existing state, or to a new one created from the provided designuration.
 * @param design A designuration object for a new state — or a state returned from createState.
 * @param dependencies (optional) An array of dependencies that, when changed, will rebuild a new state from the provided design.
 */

export function useStateDesigner<D, V extends Record<string, S.Value<D>>>(
  design: S.DesignedState<D, V>
): S.DesignedState<D, V>

export function useStateDesigner<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(design: S.Design<D, R, C, A, Y, T, V>): S.DesignedState<D, V>

export default function useStateDesigner<
  D,
  R extends Record<string, S.Result<D>>,
  C extends Record<string, S.Condition<D>>,
  A extends Record<string, S.Action<D>>,
  Y extends Record<string, S.Async<D>>,
  T extends Record<string, S.Time<D>>,
  V extends Record<string, S.Value<D>>
>(
  design: S.Design<D, R, C, A, Y, T, V> | S.DesignedState<D, V>,
  dependencies: any[] = emptyArray
) {
  const rFirstMount = React.useRef(true)

  const [current, setCurrent] = React.useState<S.DesignedState<D, V>>(() =>
    'active' in design ? design : createState(design)
  )

  // Global
  React.useEffect(() => {
    if (!('active' in design)) return

    setCurrent(design)

    return design.onUpdate(update =>
      setCurrent(current => ({
        ...current,
        index: update.index,
        data: update.data,
        active: update.active,
        stateTree: update.stateTree,
        values: update.values,
        log: update.log,
      }))
    )
  }, [design])

  // Local
  React.useEffect(() => {
    if ('active' in design) return

    function handleUpdate(update: typeof current) {
      setCurrent(current => ({
        ...current,
        index: update.index,
        data: update.data,
        active: update.active,
        stateTree: update.stateTree,
        values: update.values,
        log: update.log,
      }))
    }

    // Only create a new state if the `design` property is design object.
    if (!rFirstMount.current) {
      const next = createState(design)
      setCurrent(next)
      return next.onUpdate(handleUpdate)
    }

    rFirstMount.current = false
    return current.onUpdate(handleUpdate)
  }, [...dependencies])

  return current
}
