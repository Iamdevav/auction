import { combineReducers } from "redux";
import Auction from './auction'


const rootReducers = combineReducers({
    Auction
})

export default (state, action) => rootReducers(state, action)