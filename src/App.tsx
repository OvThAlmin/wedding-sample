import React from 'react'
import './App.css'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import UploadImg from './pages/UploadImg'
import SlidesScreen from './pages/SlidesScreen'

function App() {
  return (
    <React.Fragment>
      <div className="App">
        <header>
          <meta property="og:site_name" content="Sample Wedding App" />
          <title>Sample Wedding App</title>
        </header>
        <body>
          <Router>
            <article>
              <Route exact path="/" component={UploadImg} />
              <Route path="/slides" component={SlidesScreen} />
            </article>
          </Router>
        </body>
      </div>
    </React.Fragment>
  )
}

export default App
