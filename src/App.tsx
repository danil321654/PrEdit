import React from 'react'
import axios from 'axios'
import { noop } from 'lodash-es'
import { Provider } from 'react-redux'
import { configureStore } from './store'
import { RichTextEditor } from './components'
import { ApiContextProvider } from './contexts'

const apiClient = axios.create()

const store = configureStore({ apiClient })

const App = ({ ...rest }) => {
  return (
    <Provider store={store}>
      <ApiContextProvider apiClient={apiClient}>
        <RichTextEditor
          onUpdate={noop}
          editable
          setIsEmptyEditor={noop}
          {...rest}
        />
      </ApiContextProvider>
    </Provider>
  )
}

export default App
