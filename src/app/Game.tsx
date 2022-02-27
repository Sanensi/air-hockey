import { css } from "@emotion/react";
import { useEffect, useRef } from "react";
import { AirHockey } from "../game/AirHockey";

const FullSize = css`
  display: block;
  width: 100%;
  height: 100%;
`;

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("No HTMLCanvasElement found");

    const game = new AirHockey(canvas);
    game.start();

    return () => game.destroy();
  }, []);

  return (
    <canvas
      css={FullSize}
      ref={canvasRef}
    />
  );
};