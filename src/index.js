import React from 'react';
import {createRoot} from 'react-dom';
import App from './App';

const ROOT = document.getElementById('root');
createRoot(ROOT).render(<React.StrictMode><App /></React.StrictMode>);

