import { ThemeProvider } from "@mui/material";
import { FC } from "react";
import { RoutingProvider } from "./app/Routing";
import { theme } from "./app/theme";

export const ApplicationContext: FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <RoutingProvider>
        {children}
      </RoutingProvider>
    </ThemeProvider>
  );
};