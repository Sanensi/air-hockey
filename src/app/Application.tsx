import styled from "@emotion/styled";
import { Container } from "@mui/material";

const Red = styled.span`
  color: red;
`

export const Application = () => {
  return (
    <Container>
      Hello <Red>World!</Red>
    </Container>
  );
}