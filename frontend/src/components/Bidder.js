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

const ENDPOINT = "http://localhost:5000";
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
      console.log(data.length);
      if (bidders.length === 0) {
        setBidAmount(data.length !== 0 && parseInt(data[0].price) + 100);
      }
    });
    socket.on("getBids", (data) => {
      setBidders(data);
      if (data.length !== 0) {
        setBidAmount(data[data.length - 1].amount + 100);
      }
    });
  }, [bidStatus]);

  const handleBidderSubmit = async (event) => {
    event.preventDefault();
    if (bidderName.trim() === "") {
      setShowValidation(true);
      return;
    }
    setIsLoggingIn(true);
    if (bidderName) {
      setUserType("Bidder");
      const data = {
        name: bidderName,
        userType: "Biddder",
      };
      await api.post(`login`, data);
      localStorage.setItem("users", JSON.stringify(data));
      setTimeout(() => {
        setIsLoggingIn(false);
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
    await api.post(`bids`, data);
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
    <Container className="container-box">
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
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoggingIn}
              className="all-button"
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
        <ToastContainer position="top-right" autoClose={3000} />
      </Card>
      <Modal show={showBidderModal} onHide={handlebidderModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Easy Bid</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="itemName">
              <Form.Label>Your Name &nbsp;&nbsp;- </Form.Label>
              <Form.Label className="product-name">{bidderName}</Form.Label>
            </Form.Group>
            {auctions.length > 0 && <Form.Group controlId="itemName">
              <Form.Label>Auction Item - </Form.Label>
              <Form.Label className="product-name">
                <Form.Label>
                  {auctions.length > 0 && auctions[0].name}
                </Form.Label>
              </Form.Label>
            </Form.Group>}
            {auctions.length === 0 && "There is no Auction item"}
            {auctions.length > 0 && (
              <Form.Group controlId="startingPrice" className="mb-3">
                <Form.Label>Current Price -</Form.Label>

                {bidders.length !== 0 ? (
                  <Form.Label>${bidders[bidders.length - 1].amount}</Form.Label>
                ) : (
                  <Form.Label className="product-name">
                    {" "}
                    {"$" + auctions[0]?.price}
                  </Form.Label>
                  // "$" + auctions[0]?.price
                )}
              </Form.Group>
            )}
            {auctions.length > 0 && (
              <Form.Group controlId="itemName">
                <Form.Label>Auction Item Current Status : {auctions[0]?.buttonStatus === "Stop" ? "Stop Auction" : auctions[0].status !== "pending" && auctions[0].status}</Form.Label>
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
              </Form.Group>
            )}
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
              disabled={
                auctions.length !== 0 && auctions[0].buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                    ? true
                    : auctions[0].status !== "pending" && true
              }
            >
              You Paid {bidAmount}
            </Button>
            <Button
              variant="white"
              onClick={() => {
                setBidAmount(parseInt(bidAmount) + 100);
              }}
              disabled={
                auctions.length !== 0 && auctions[0].buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                    ? true
                    : auctions[0].status !== "pending" && true
              }
            >
              +100
            </Button>
            <Button
              variant="white"
              onClick={() => setBidAmount(parseInt(bidAmount) + 200)}
              disabled={
                auctions.length !== 0 && auctions[0].buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                    ? true
                    : auctions[0].status !== "pending" && true
              }
            >
              +200
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                setBidAmount(bidders[bidders.length - 1].amount + 100)
              }
              disabled={
                auctions.length !== 0 && auctions[0].buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                    ? true
                    : auctions[0].status !== "pending" && true
              }
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
