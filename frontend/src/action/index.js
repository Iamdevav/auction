import api from '../api'

export const login = (data) => async (dispatch) => {
    try {
        const res = await api.post(`login`, data)
        localStorage.setItem('users', JSON.stringify(res.data))

        return res
    } catch (error) {

    }
}

export const getAuction = () => async (dispatch) => {
    try {
        const res = await api.get(`auctions`)

        return res.data
    } catch (error) {

    }
}

export const createAuction = (data) => async (dispatch) => {
    try {

        const res = await api.post('auctions', data)


    } catch (error) {

    }
}

export const createBid = (data) => async (dispatch) => {
    try {
        const res = await api.post(`bids`, data)

        return res
    } catch (error) {

    }
}

export const getBids = () => async (dispatch) => {
    try {
        const res = await api.get(`bids`)
        return res.data
    } catch (error) {

    }
}