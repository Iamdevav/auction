import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Card, Button, Form, Modal, Row, Col } from "react-bootstrap";
import { createBid, getAuction, getBids, login } from "../action";
const Bidder = () => {
  const [auctions, setAuctions] = useState([]);
  const [bidderName, setBidderName] = useState("");
  const dispatch = useDispatch();
  const [showBidderModal, setShowBidderModal] = useState(false);
  const [bidders, setBidders] = useState([]);
  const [bidAmount, setBidAmount] = useState();
  const [userType, setUserType] = useState();
  const currentUser = JSON.parse(localStorage.getItem("users"));

  useEffect(() => {
    async function getAuctionData() {
      setAuctions(await dispatch(getAuction()));
    }
    getAuctionData();
  }, []);

  useEffect(() => {
    async function getAuctionData() {
      setAuctions(await dispatch(getAuction()));
      setBidders(await dispatch(getBids()));
    }
    getAuctionData();
  }, []);

  const handleBidderSubmit = (event) => {
    event.preventDefault();
    if (bidderName) {
      setUserType("Bidder");
      const data = {
        name: bidderName,
        userType: "Biddder",
      };
      dispatch(login(data));
      setShowBidderModal(true);
      setBidAmount(
        auctions.length > 0 && bidders.length === 0
          ? parseInt(auctions[0].price) + 100
          : bidders.length > 0 && bidders[bidders.length - 1].amount + 100
      );
    }
  };
  const handlebidderModalSubmit = (event, bidPrice) => {
    event.preventDefault();
    const data = {
      auction_id: auctions.length > 0 && auctions[0].id,
      amount: bidPrice,
      name: bidderName,
    };
    dispatch(createBid(data));
  };
  const handlebidderModalClose = () => {
    setShowBidderModal(false);
  };
  return (
    <div className="container" style={{ marginTop: "100px" }}>
      <Card>
        <Card.Body>
          <Card.Title>Bidder</Card.Title>
          <Form onSubmit={handleBidderSubmit}>
            <Form.Group controlId="auctioneerName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={bidderName}
                onChange={(event) => setBidderName(event.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <Modal show={showBidderModal} onHide={handlebidderModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Easy Bid</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="itemName">
              <Form.Label>{bidderName}</Form.Label>
            </Form.Group>
            <Form.Group controlId="itemName">
              <Form.Label>
                <b>{auctions.length > 0 && auctions[0].name}</b>
              </Form.Label>
            </Form.Group>
            <Form.Group controlId="startingPrice" className="mb-3">
              <Form.Label>Current Price</Form.Label>
              {bidders.length === 0 ? (
                auctions.map((auction) => (
                  <Row className="gx-0">
                    <Col>
                      <p>
                        {auction.name} - ${auction.price}
                      </p>
                    </Col>
                  </Row>
                ))
              ) : (
                <Row className="gx-0">
                  <Col>
                    <p>
                      {bidders[bidders.length - 1].name} - $
                      {bidders[bidders.length - 1].amount}
                    </p>
                  </Col>
                </Row>
              )}
            </Form.Group>
            <hr />

            <Button
              variant="primary"
              type="submit"
              onClick={(e) =>
                handlebidderModalSubmit(
                  e,
                  auctions.length > 0 && bidders.length === 0
                    ? parseInt(auctions[0].price) + 100
                    : bidders.length > 0 &&
                        bidders[bidders.length - 1].amount + 100
                )
              }
              disabled={
                auctions.length === 0
                  ? true
                  : bidders.length > 0 &&
                    bidders[bidders.length - 1].name === currentUser?.name
              }
            >
              You Paid {bidAmount}
            </Button>
            <Button
              variant="white"
              onClick={() => {
                setBidAmount(parseInt(bidAmount) + 500);
              }}
              disabled={auctions.length === 0 && true}
            >
              +500
            </Button>
            <Button
              variant="white"
              onClick={() => setBidAmount(parseInt(bidAmount) + 1000)}
              disabled={auctions.length === 0 && true}
            >
              +1000
            </Button>
            <Button
              variant="danger"
              onClick={() => console.log(bidAmount)}
              disabled={auctions.length === 0 && true}
            >
              Reset
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Bidder;
