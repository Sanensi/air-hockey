import { ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { MainMenu } from "./MainMenu";

export const Application = () => {
  return (
    <ThemeProvider theme={theme} >
      <MainMenu />
    </ThemeProvider>
  );
};