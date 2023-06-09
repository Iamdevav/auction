import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { getAuction } from "../action"

const Bidder = () => {
    const [auctions, setAuctions] = useState()
    const dispatch = useDispatch()

    useEffect(() => {
        async function getAuctionData() {
            setAuctions(await dispatch(getAuction()))
        }
        getAuctionData()
    }, [])
    return (
        <div>
            <div>{console.log(auctions)}</div>
        </div>
    )

}

export default Bidder