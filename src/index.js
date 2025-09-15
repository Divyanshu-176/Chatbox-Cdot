import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import reactToWebComponent from 'react-to-webcomponent';

// Convert React component to Web Component
// const WebChatBot = reactToWebComponent(App, React, ReactDOM);
// customElements.define('my-chatbot', WebChatBot);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();
