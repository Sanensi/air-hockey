import { createTheme, responsiveFontSizes } from "@mui/material";

const baseTheme = createTheme({
  typography: {
    allVariants: {
      color: "#2c3e50"
    }
  }
});

export const theme = responsiveFontSizes(baseTheme);
