/* eslint-disable react/display-name */
import React from "react"
import { flow } from "lodash-es"

interface ContextProvider<T> {
  component: React.FC<T>
  props: T
}
interface ProviderComposerProps {
  providers: Array<ContextProvider<any>>
  children?: React.ReactNode
}

export const getContextProvider = <T,>(
  component: React.FC<T>,
  props: T
): ContextProvider<T> => ({
  component,
  props,
})

export const ContextProvidersComposer: React.FC<ProviderComposerProps> = ({
  providers,
  children,
}) => {
  return flow(
    providers.map(({ component: Component, props }) => (_children) => (
      <Component {...props}>{_children}</Component>
    ))
  )(children)
}
