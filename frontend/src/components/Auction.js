import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Form,
  Modal,
  Row,
  Col,
  Container,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useDispatch } from "react-redux";
import { createAuction, getAuction, getBids, login } from "../action";
import "./style.css";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Auction = () => {
  const [auctioneerName, setAuctioneerName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [userType, setUserType] = useState();
  const [auctions, setAuctions] = useState([]);
  const [bidders, setBidders] = useState([]);
  const [showValidation, setShowValidation] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    if (auctioneerName.trim() === "") {
      setShowValidation(true);
      return;
    }
    setIsLoggingIn(true);
    setUserType("Auctioneer");
    const data = {
      name: auctioneerName,
      userType: "Auctioneer",
    };
    dispatch(login(data));
    setTimeout(() => {
      setIsLoggingIn(false);
      toast.success("Login successful!");
      setShowModal(true);
    }, 1000);
    // setShowModal(true);
  };

  const handleModalSubmit = (event) => {
    event.preventDefault();
    if (!itemName || !startingPrice) {
      toast.error("Please enter item name and starting price.");
      return;
    }
    console.log("Item Name:", itemName);
    console.log("Starting Price:", startingPrice);
    const data = {
      name: itemName,
      price: startingPrice,
    };
    dispatch(createAuction(data));

    setItemName("");
    setStartingPrice("");
    toast.success("Your item is ready to sell!");
  };

  const handleModalClose = () => {
    setShowModal(false);
  };
  const handleNameChange = (event) => {
    if (showValidation) {
      setShowValidation(false);
    }
    setAuctioneerName(event.target.value);
  };

  return (
    <Container className="container-box">
      <h1 className="heading-text">Bidding Platform</h1>
      <div>
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Auctioneer Screen</Card.Title>
                {showValidation && (
                  <Alert variant="danger">Please enter your name.</Alert>
                )}

                <Form onSubmit={handleAuctioneerSubmit}>
                  <Form.Group controlId="auctioneerName" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={auctioneerName}
                      onChange={handleNameChange}
                      // onChange={(event) =>
                      //   setAuctioneerName(event.target.value)
                      // }
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Spinner animation="border" size="sm" /> Logging in...
                      </>
                    ) : (
                      "Auction Login"
                    )}
                  </Button>
                  <Link className="bidder-buttton" to="/bidder">
                    Bidder Login
                  </Link>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <ToastContainer position="top-center" autoClose={3000} />
        </Row>
        {/* aution model --------------------------- */}
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
                  <Form.Label>Auction Item </Form.Label>
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
                <p className="price-text">current price</p>
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
      </div>
    </Container>
  );
};

export default Auction;
