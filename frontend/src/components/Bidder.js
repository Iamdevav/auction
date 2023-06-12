import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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
import "./style.css";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socketIo from "socket.io-client";
import { FaArrowLeft } from "react-icons/fa";
import api from "../api";

const ENDPOINT = "http://localhost:3000";
let socket;

const Bidder = () => {
  const [auctions, setAuctions] = useState([]);
  const [bidderName, setBidderName] = useState("");
  const [showBidderModal, setShowBidderModal] = useState(false);
  const [bidders, setBidders] = useState([]);
  const [bidAmount, setBidAmount] = useState();
  const [userType, setUserType] = useState();
  const currentUser = JSON.parse(localStorage.getItem("users"));
  const [showValidation, setShowValidation] = useState(false);
  const [bidStatus, setBidStatus] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ["websocket"] });
    socket.on("getAuction", (data) => {
      setAuctions(data);
      console.log(data.length)
      if (bidders.length === 0) {
        setBidAmount(data.length !== 0 && parseInt(data[0].price) + 100)
      }
    });
    socket.on("getBids", (data) => {
      setBidders(data);
      if (data.length !== 0) {
        setBidAmount(data[data.length - 1].amount + 100)
      }
    });
  }, [bidStatus]);

  const handleBidderSubmit = async (event) => {
    event.preventDefault();
    if (bidderName.trim() === "") {
      setShowValidation(true);
      return;
    }
    if (bidderName) {
      setUserType("Bidder");
      const data = {
        name: bidderName,
        userType: "Biddder",
      };
      await api.post(`login`, data)
      localStorage.setItem('users', JSON.stringify(data))
      setTimeout(() => {
        toast.success("Login successful!");
        setShowBidderModal(true);
      }, 2000);
      // setShowBidderModal(true);
      setBidAmount(
        auctions.length > 0 && bidders.length === 0
          ? parseInt(auctions[0].price) + 100
          : bidders.length > 0 && bidders[bidders.length - 1].amount + 100
      );
    }
  };
  const handlebidderModalSubmit = async (event, bidPrice) => {
    event.preventDefault();
    const data = {
      auction_id: auctions.length > 0 && auctions[0].id,
      amount: bidPrice,
      name: bidderName,
    };
    await api.post(`bids`, data)
    setBidStatus(true);
    setTimeout(() => {
      setBidStatus(false);
    }, 1000);
  };
  const handlebidderModalClose = () => {
    setShowBidderModal(false);
  };
  const handleNameChange = (event) => {
    if (showValidation) {
      setShowValidation(false);
    }
    setBidderName(event.target.value);
  };
  return (
    <Container className="container-bidderBox">
      <Card className="custom-card">
        <Card.Body>
          <div className="back-button">
            <div>
              <Link to="/">
                <FaArrowLeft className="back-icon" />
              </Link>
            </div>
            <div style={{ marginLeft: "10px" }}>
              <Card.Title>Bidder</Card.Title>
            </div>
          </div>
          <hr />
          {showValidation && (
            <Alert variant="danger">Please enter your name.</Alert>
          )}
          <Form onSubmit={handleBidderSubmit}>
            <Form.Group controlId="auctioneerName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={bidderName}
                onChange={handleNameChange}
              // onChange={(event) => setBidderName(event.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoggingIn}
              style={{ width: "57vh" }}
            >
              {isLoggingIn ? (
                <>
                  <Spinner animation="border" size="sm" /> Logging in...
                </>
              ) : (
                "Bidder Login"
              )}
            </Button>
          </Form>
        </Card.Body>
        <ToastContainer position="top-center" autoClose={3000} />
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
                  bidders.length === 0
                    ? parseInt(auctions[0].price) + 100
                    : bidders.length > 0 &&
                    bidders[bidders.length - 1].amount + 100
                )
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
            <Button
              variant="danger"
              onClick={() => setBidAmount(bidders[bidders.length - 1].amount + 100)}

            >
              Reset
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Bidder;
