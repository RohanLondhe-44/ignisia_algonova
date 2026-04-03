import { useState } from 'react'
import {BrowserRouter} from 'react-router-dom'
import { Route , Routes , Link } from 'react-router-dom'
import { Dashboard } from './assets/pages/Dashboard'
import  Feed  from './assets/pages/Feed'
import { Home } from './assets/pages/Home'
import './App.css'
import { Footer } from './assets/components/Footer'
import { Header } from './assets/components/Header'
import  Report  from './assets/pages/Report';
const App = () => {
  return(
      <BrowserRouter>
      <Header/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/feed' element={<Feed/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/report' element={<Report/>}/>
        </Routes>
        <Footer/>
      </BrowserRouter>
  )
}

export default App
