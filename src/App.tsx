import React from "react"
import axios from "axios"
import { noop } from "lodash-es"
import { Provider } from "react-redux"
import { configureStore } from "./store"
import { RichTextEditor } from "./components"
import { ApiContextProvider } from "./contexts"
import { ContextProvidersComposer, getContextProvider } from "./helpers"

const apiClient = axios
const App = ({ ...rest }) => {
  const store = configureStore({ apiClient })
  return (
    <Provider store={store}>
      <ContextProvidersComposer
        providers={[
          getContextProvider<Record<string, unknown>>(ApiContextProvider, {
            apiClient,
          }),
        ]}
      >
        <RichTextEditor
          onUpdate={noop}
          editable
          setIsEmptyEditor={noop}
          {...rest}
        />
      </ContextProvidersComposer>
    </Provider>
  )
}

export default App
