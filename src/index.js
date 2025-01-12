// Required for webpack :P
import React from 'react';
window.React = React;

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import { createRoot } from 'react-dom/client';
import App from './App.js';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
