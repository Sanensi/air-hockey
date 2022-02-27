import styled from "@emotion/styled";
import { CircularProgress } from "@mui/material";
import { useEffect, useReducer, useRef } from "react";
import { AirHockey } from "../game/AirHockey";

export const Game = () => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<AirHockey>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("No HTMLCanvasElement found");

    const game = new AirHockey(canvas);
    forceUpdate();

    game.onUpdate = forceUpdate;
    gameRef.current = game;

    return () => game.destroy();
  }, []);

  return (
    <>
      <StyledCanvas
        $visible={!gameRef.current?.loading}
        ref={canvasRef}
      />
      {gameRef.current?.loading && <Progress />}
    </>
  );
};

const StyledCanvas = styled.canvas<{ $visible: boolean }>(({ $visible }) => `
  display: ${$visible ? 'block' : 'none'};
  width: 100%;
  height: 100%;
`);


const Progress = () => (
  <div
    css={{
      width: "100%",
      height: "100%",
      position: "absolute",
      top: "0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <CircularProgress />
  </div>
);