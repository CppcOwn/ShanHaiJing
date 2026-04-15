import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Map from './pages/Map'
import Weather from './pages/Weather'
import Search from './pages/Search'

interface Page {
  id: string;
  name: string;
  component: React.ReactNode;
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');

  const pages: Page[] = [
    { id: 'home', name: '首页', component: <Home /> },
    { id: 'map', name: '地图', component: <Map /> },
    { id: 'weather', name: '天气', component: <Weather /> },
    { id: 'search', name: '搜索', component: <Search /> }
  ];

  return (
    <div className="app">
      <main className="app-content">
        {pages.find(page => page.id === currentPage)?.component}
      </main>
      <footer className="app-footer">
        {pages.map(page => (
          <button
            key={page.id}
            className={`footer-btn ${currentPage === page.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(page.id)}
          >
            <span className="btn-icon">
              {page.id === 'home' && '🏠'}
              {page.id === 'map' && '🗺️'}
              {page.id === 'weather' && '🌤️'}
              {page.id === 'search' && '🔍'}
            </span>
            <span className="btn-text">{page.name}</span>
          </button>
        ))}
      </footer>
    </div>
  )
}

export default App