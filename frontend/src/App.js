
import './App.css';
import Auction from './components/Auction';
import Bidder from './components/Bidder';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' Component={Auction} />
        <Route path='/bidder' Component={Bidder} />
      </Routes>
    </Router>
  )
}

export default App;
