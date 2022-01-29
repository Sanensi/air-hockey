import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Button, Card, Typography } from "@mui/material";

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
  return (
    <Container>
      <Card
        elevation={6}
        sx={{ padding: 2 }}
        css={SpacedChildren}
      >
        <Typography
          variant="h2"
          component="h1"
          textAlign="center"
          sx={{ marginBottom: 3 }}
        >
          Air Hockey
        </Typography>
        <Button variant="contained" fullWidth>
          Local Game
        </Button>
        <Button variant="contained" fullWidth disabled>
          Online Game
        </Button>
      </Card>
    </Container>
  );
};