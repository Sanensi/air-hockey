import React, { useContext, useState } from "react";
import { FC } from "react";

export enum Routes {
  Main = "main",
  Local = "local"
}

interface UseRouting {
  current: Routes;
  setRoute: (route: Routes) => void;
}

const RoutingContext = React.createContext<UseRouting | undefined>(undefined);

export const RoutingProvider: FC = ({ children }) => {
  const [state, setState] = useState(Routes.Main);

  return (
    <RoutingContext.Provider
      value={{
        current: state,
        setRoute: setState
      }}
    >
      {children}
    </RoutingContext.Provider>
  );
};

export const useRouting = () => {
  const context = useContext(RoutingContext);

  if (context === undefined) throw new Error("No RoutingContext provided for useRouting");

  return context;
};
