import React, { createContext, useContext } from 'react'
import { AxiosInstance } from 'axios'

export interface ApiContextProps {
  apiClient: AxiosInstance
}

export type ApiContextValues = ApiContextProps & {
  children: React.ReactNode
}

const ApiContext = createContext({} as ApiContextProps)

export const ApiContextProvider: React.FC<ApiContextValues> = ({
  children,
  apiClient,
}) => {
  return (
    <ApiContext.Provider
      value={{
        apiClient,
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}

export const useApiContext = () => useContext(ApiContext)
