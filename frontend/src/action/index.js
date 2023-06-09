import api from '../api'

export const login = (name) => async (dispatch) => {
    try {
        const res = await api.post(`login`, name)
        console.log(res)
        // dispatch({
        //     ty
        // })
    } catch (error) {

    }
}