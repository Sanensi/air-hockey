import React from 'react';
import ReactDOM from 'react-dom';
import { Application } from './app/Application';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const root = document.getElementById("root");
ReactDOM.render(React.createElement(Application), root);
