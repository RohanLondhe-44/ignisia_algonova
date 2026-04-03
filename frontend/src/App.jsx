import { useState } from 'react'
import {BrowserRouter} from 'react-router-dom'
import { Route , Routes , Link } from 'react-router-dom'
import { Dashboard } from './assets/pages/Dashboard'
import { Feed } from './assets/pages/Feed'
import { Home } from './assets/pages/Home'
import './App.css'

const App = () => {
  return(
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/feed' element={<Feed/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
