import { Game } from "./Game";
import { MainMenu } from "./MainMenu";
import { Routes, useRouting } from "./Routing";

export const Application = () => {
  const { current } = useRouting();

  switch (current) {
    case Routes.Main:
      return <MainMenu />;  
    case Routes.Local:
      return <Game />;
  }
};