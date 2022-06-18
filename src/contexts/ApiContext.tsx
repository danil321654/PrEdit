import React, { createContext, useContext } from "react";

const ApiContext = createContext({});

export const ApiContextProvider: React.FC = ({ children, apiClient }) => {
  return (
    <ApiContext.Provider
      value={{
        apiClient,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApiContext = () => useContext(ApiContext);
