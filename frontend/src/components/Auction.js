import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Form,
  Modal,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import {
  createAuction,
  createBid,
  getAuction,
  getBids,
  login,
} from "../action";
import "./style.css";

const Auction = () => {
  const [auctioneerName, setAuctioneerName] = useState("");
  const [bidderName, setBidderName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [userType, setUserType] = useState();
  const [showBidderModal, setShowBidderModal] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [bidders, setBidders] = useState([]);
  const [bidAmount, setBidAmount] = useState();
  const [addAmount, setAddAmount] = useState();

  const currentUser = JSON.parse(localStorage.getItem("users"));

  const dispatch = useDispatch();

  useEffect(() => {
    async function getAuctionData() {
      setAuctions(await dispatch(getAuction()));
      setBidders(await dispatch(getBids()));
    }
    getAuctionData();
  }, []);

  const handleAuctioneerSubmit = (event) => {
    event.preventDefault();
    setUserType("Auctioneer");
    const data = {
      name: auctioneerName,
      userType: "Auctioneer",
    };
    dispatch(login(data));
    setShowModal(true);
  };

  const handleModalSubmit = (event) => {
    event.preventDefault();
    console.log("Item Name:", itemName);
    console.log("Starting Price:", startingPrice);
    const data = {
      name: itemName,
      price: startingPrice,
    };
    dispatch(createAuction(data));

    setItemName("");
    setStartingPrice("");
  };

  const handleModalClose = () => {
    setShowModal(false);
  };
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
    <Container className="container-box">
      <h1 className="heading-text">Bidding Platform</h1>
      <div>
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Auctioneer</Card.Title>
                <Form onSubmit={handleAuctioneerSubmit}>
                  <Form.Group controlId="auctioneerName" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={auctioneerName}
                      onChange={(event) =>
                        setAuctioneerName(event.target.value)
                      }
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col>
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
          </Col>
        </Row>

        {userType === "Auctioneer" && (
          <Modal show={showModal} onHide={handleModalClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>Easy Bid</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="itemName">
                  <Form.Label>Your Name -&nbsp;&nbsp;</Form.Label>
                  <Form.Label> {auctioneerName}</Form.Label>
                </Form.Group>
                <Form.Group controlId="itemName">
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter item name"
                    value={
                      auctions.length > 0
                        ? auctions[auctions.length - 1].name
                        : itemName
                    }
                    onChange={(event) => setItemName(event.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="startingPrice" className="mb-3">
                  <Form.Label>Starting Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter starting price"
                    value={
                      auctions.length > 0
                        ? auctions[auctions.length - 1].price
                        : startingPrice
                    }
                    onChange={(event) => setStartingPrice(event.target.value)}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  onClick={handleModalSubmit}
                  disabled={auctions.length > 0}
                >
                  Start Auction
                </Button>
                <Button
                  className="stop-button"
                  variant="danger"
                  type="submit"
                  onClick={handleModalSubmit}
                  disabled={auctions.length > 0}
                >
                  Stop Auction
                </Button>
                <hr />
                <p className="price-text"> current price</p>
                {bidders.map((bid) => (
                  <div className="price-container">
                    <div>
                      <p>{bid.name}</p>
                    </div>
                    <div>
                      <p>${bid.amount}</p>
                    </div>
                  </div>
                ))}
              </Form>
            </Modal.Body>
          </Modal>
        )}
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
                  bidders.length > 0 &&
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
              >
                +500
              </Button>
              <Button
                variant="white"
                onClick={() => setBidAmount(parseInt(bidAmount) + 1000)}
              >
                +1000
              </Button>
              <Button variant="danger" onClick={() => console.log(bidAmount)}>
                Reset
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </Container>
  );
};

export default Auction;
