import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Form,
  Modal,
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
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState();
  const [showValidation, setShowValidation] = useState(false);
  const [bidStatus, setBidStatus] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showWonItemToast, setShowWonItemToast] = useState(false);
  const [showBidAgainToast, setShowBidAgainToast] = useState(false);
  const [message, setMessage] = useState();

  const AuctioneerName =
    auctions.length > 0 && auctions[auctions.length - 1]?.name;

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ["websocket"] });
    let auctionData;
    socket.on("getAuction", (data) => {
      setAuctions(data);
      auctionData = data;
      if (bids.length === 0) {
        setBidAmount(
          data.length !== 0 && parseInt(data[data.length - 1].price) + 100
        );
      }
    });
    socket.on("getBids", (data) => {
      setBids(data);
      if (data.length !== 0) {
        var lastData = data[data.length - 1];
        setBidAmount(
          lastData.auction_id === auctionData[auctionData.length - 1].id
            ? parseInt(lastData.amount) + 100
            : parseInt(auctionData[auctionData.length - 1].price) + 100
        );
      }
    });
  }, [bidStatus]);

  useEffect(() => {
    if (
      auctions.length > 0 &&
      auctions[auctions.length - 1]?.status === "sold" &&
      bidderName === bids[bids.length - 1]?.name &&
      !showWonItemToast
    ) {
      setShowWonItemToast(true);
      toast.success("Congratulations! You won this item!");
    } else if (
      showWonItemToast &&
      (auctions.length === 0 ||
        auctions[auctions.length - 1]?.status !== "sold" ||
        bidderName !== bids[bids.length - 1]?.name)
    ) {
      setShowWonItemToast(false);
    }
  }, [auctions, bids, bidderName, showWonItemToast]);

  useEffect(() => {
    if (
      auctions.length > 0 &&
      auctions[auctions.length - 1]?.status === "sold" &&
      bids[bids.length - 1]?.name !== bidderName &&
      !showBidAgainToast
    ) {
      setShowBidAgainToast(true);

      toast.warning("This item is sold!");
    } else if (
      showBidAgainToast &&
      (auctions.length === 0 ||
        auctions[auctions.length - 1]?.status === "pending" ||
        bids[bids.length - 1]?.name === bidderName)
    ) {
      setShowBidAgainToast(false);
    }
  }, [auctions, bids, bidderName, showBidAgainToast]);

  useEffect(() => {
    let hasOutbid = false;
    const auction = auctions[auctions.length - 1];

    if (
      bids.filter((data) => data.auction_id === auction?.id).length !== 0 &&
      auction?.status === "pending" &&
      bids[bids.length - 1]?.name !== bidderName
    ) {
      const uniqueBidders = bids.filter(
        (elem, ix) => bids.findIndex((elem1) => elem1.name === elem.name) === ix
      );

      for (let i = 0; i < uniqueBidders.length; i++) {
        const bid = bids.filter((data) => data.auction_id === auction?.id);

        if (
          uniqueBidders[i].name === bid[i]?.name &&
          bid[i]?.name === bidderName
        ) {
          hasOutbid = true;
          break;
        } else if (
          uniqueBidders[i].name !== bids[bids.length - 1]?.name &&
          bid[i]?.name === bidderName
        ) {
          hasOutbid = true;
          break;
        }
      }
    }

    if (hasOutbid) {
      setMessage("You have been outbid! Bid again!");
      toast.warning("You have been outbid! Bid again!");
    }
  }, [bids.length]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (bidderName.trim() === "") {
      setShowValidation(true);
      return;
    } else {
    }
    setIsLoggingIn(true);

    const data = {
      name: bidderName,
      userType: "Biddder",
    };
    await api.post(`login`, data);
    setTimeout(() => {
      setIsLoggingIn(false);
      toast.success("Login successful!");
      setShowBidderModal(true);
    }, 2000);
    setBidAmount(
      auctions.length > 0 && bids.length === 0
        ? parseInt(auctions[auctions.length - 1]?.price) + 100
        : bids[bids.length - 1]?.auction_id ===
          auctions[auctions.length - 1]?.id
        ? bids.length !== 0 && parseInt(bids[bids.length - 1].amount) + 100
        : parseInt(auctions[auctions.length - 1]?.price) + 100
    );
  };

  const handleSubmitBid = async (event) => {
    event.preventDefault();
    const data = {
      auction_id: auctions.length > 0 && auctions[auctions.length - 1]?.id,
      amount: bidAmount,
      name: bidderName,
    };
    const bidAmountCheck =
      bids.length > 0
        ? auctions[auctions.length - 1]?.id === bids[bids.length - 1].auction_id
          ? bids[bids.length - 1]?.amount
          : auctions[auctions.length - 1]?.price
        : auctions[auctions.length - 1]?.price;
    if (bidAmountCheck >= bidAmount) {
      return toast.error("Amount must be more than current price");
    }
    await api.post(`bids`, data);
    setBidStatus(true);
    // This setTimeout method for changing bidStatus value to call useEffect
    setTimeout(() => {
      setBidStatus(false);
      toast.success("Bid successful! You are currently the highest bidder.");
    }, 1000);
  };
  const handleNameChange = (event) => {
    if (showValidation) {
      setShowValidation(false);
    }
    setBidderName(event.target.value);
  };
  return (
    <Container className="container-box">
      <h1 className="heading-text">Bidding Platform 2.0</h1>
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
          <Form onSubmit={handleLogin}>
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
      <Modal
        show={showBidderModal}
        onHide={() => setShowBidderModal(false)}
        backdrop="static"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Bidding View</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="item-name">
              <Form.Label>Your Name - </Form.Label>
              <Form.Label className="product-name">{bidderName}</Form.Label>
            </Form.Group>
            {auctions.length > 0 && (
              <>
                <Form.Group controlId="item-name">
                  <Form.Label>Auction Item - </Form.Label>
                  <Form.Label className="product-name">
                    <Form.Label>{AuctioneerName}</Form.Label>
                  </Form.Label>
                </Form.Group>

                <Form.Group controlId="startingPrice" className="mb-3">
                  <Form.Label>Current Price -</Form.Label>

                  {bids.length !== 0 ? (
                    <Form.Label className="product-name">
                      {bids[bids.length - 1].auction_id ===
                      auctions[auctions.length - 1]?.id
                        ? "$" + bids[bids.length - 1].amount
                        : auctions[auctions.length - 1]?.price}
                    </Form.Label>
                  ) : (
                    <Form.Label className="product-name">
                      {" "}
                      {"$" + auctions[auctions.length - 1]?.price}
                    </Form.Label>
                  )}
                </Form.Group>

                <Form.Group controlId="item-name">
                  <Form.Label> Auction Item Current Status -</Form.Label>
                  <Form.Label className="current-status">
                    {auctions[auctions.length - 1]?.buttonStatus === "Stop"
                      ? "Stop Auction"
                      : auctions[auctions.length - 1]?.status !== "pending"
                      ? auctions[auctions.length - 1]?.status === "sold"
                        ? bidderName === bids[bids.length - 1]?.name
                          ? `You won this item for $${
                              bids[bids.length - 1]?.amount
                            }!`
                          : auctions[auctions.length - 1]?.status
                        : auctions[auctions.length - 1]?.status
                      : bids[bids.length - 1]?.name === bidderName
                      ? "You are the highest bidder."
                      : bids.filter(
                          (data) =>
                            data.auction_id ===
                            auctions[auctions.length - 1]?.id
                        ).length === 0
                      ? "Accepting Bids"
                      : !message
                      ? "Accepting Bids"
                      : message}
                  </Form.Label>
                  <hr />
                  <p className="headline-text">Bidding History</p>
                  {bids[bids.length - 1]?.auction_id ===
                  auctions[auctions.length - 1]?.id ? (
                    <div className="price-container">
                      <div>
                        <p>{bids[bids.length - 1].name}</p>
                      </div>
                      <div>
                        <p className="product-name">
                          {" "}
                          {"$" + bids[bids.length - 1].amount}
                        </p>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </Form.Group>
              </>
            )}
            <hr />${" "}
            <input
              type="number"
              className="text-center "
              style={{ width: "30%" }}
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1]?.buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1]?.status !== "pending" && true
              }
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
            <Button
              variant="primary"
              type="submit"
              className="extra-button"
              onClick={(e) => handleSubmitBid(e)}
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1]?.buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1]?.status !== "pending" && true
              }
            >
              Bid
            </Button>
            <Button
              variant="btn btn-outline-secondary"
              className="extra-button"
              onClick={() => {
                setBidAmount(parseInt(bidAmount) + 100);
              }}
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1]?.buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1]?.status !== "pending" && true
              }
            >
              +100
            </Button>
            <Button
              variant="btn btn-outline-secondary"
              className="extra-button"
              onClick={() => setBidAmount(parseInt(bidAmount) + 200)}
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1]?.buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1]?.status !== "pending" && true
              }
            >
              +200
            </Button>
            <Button
              variant="danger"
              className="extra-button"
              onClick={() =>
                setBidAmount(parseInt(bids[bids.length - 1].amount) + 100)
              }
              disabled={
                auctions.length !== 0 &&
                auctions[auctions.length - 1]?.buttonStatus === "Stop"
                  ? true
                  : auctions.length === 0
                  ? true
                  : auctions[auctions.length - 1]?.status !== "pending" && true
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
