import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Button, Card, Typography } from "@mui/material";
import { Routes, useRouting } from "./Routing";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const SpacedChildren = css`
  & > :not(:last-child) {
    margin-bottom: 16px;
  }
`;

export const MainMenu = () => {
  const { setRoute } = useRouting();

  return (
    <Container>
      <Card
        elevation={3}
        sx={{ padding: 2, minWidth: "25%" }}
        css={SpacedChildren}
      >
        <Typography
          variant="h3"
          component="h1"
          textAlign="center"
          sx={{ marginBottom: 3 }}
        >
          Air Hockey
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setRoute(Routes.Local)}
        >
          Local Game
        </Button>
        <Button variant="outlined" fullWidth disabled>
          Online Game
        </Button>
      </Card>
    </Container>
  );
};