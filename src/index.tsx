import React from 'react';
import ReactDOM from 'react-dom';
import { Application } from './app/Application';
import { ApplicationContext } from './ApplicationContext';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const Root = () => {
  return (
    <ApplicationContext>
      <Application />
    </ApplicationContext>
  );
};

const root = document.getElementById("root");
ReactDOM.render(React.createElement(Root), root);
