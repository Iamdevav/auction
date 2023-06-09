import { applyMiddleware, createStore } from 'redux'
import MainReducers from './reducers/index'
import thunk from 'redux-thunk'

const store = createStore(MainReducers, applyMiddleware(thunk))

export default store 