import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { AlbumListProvider } from './store/AlbumListContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AlbumListProvider>
      <App />
    </AlbumListProvider>
  </StrictMode>,
);
