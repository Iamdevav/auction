
import './App.css';
import Auction from './components/Auction';
import Bidder from './components/Bidder';
import store from './store';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path='/' Component={Auction} />
          <Route path='/bidder' Component={Bidder} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App;
