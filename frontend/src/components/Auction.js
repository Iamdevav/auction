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
import "./style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socketIo from "socket.io-client";
import api from "../api";
import { useNavigate } from "react-router-dom";

const ENDPOINT = "http://localhost:5000";
let socket;

const Auction = () => {
  const navigate = useNavigate();
  const [auctioneerName, setAuctioneerName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [userType, setUserType] = useState();
  const [auctions, setAuctions] = useState([]);
  const [bidders, setBidders] = useState([]);
  const [showValidation, setShowValidation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState(false);

  useEffect(() => {
    socket = socketIo(ENDPOINT, { transports: ["websocket"] });
    socket.on("getAuction", function (data) {
      setAuctions(data);
    });
    socket.on("getBids", (data) => {
      setBidders(data);
    });
  }, [auctionStatus]);

  const handleAuctioneerSubmit = async (event) => {
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
    await api.post(`login`, data);
    localStorage.setItem("users", JSON.stringify(data));
    setTimeout(() => {
      setIsLoggingIn(false);
      toast.success("Login successful!");
      setShowModal(true);
    }, 2000);
  };

  const handleModalSubmit = async (event) => {
    event.preventDefault();
    if (!itemName || !startingPrice) {
      toast.error("Please Enter Item Name and Starting Price.");
      return;
    }
    const data = {
      name: itemName,
      price: startingPrice,
      buttonStatus: "Start",
    };
    await api.post("auctions", data);
    setAuctionStatus(true);

    setTimeout(() => {
      setAuctionStatus(false);
    }, [1000]);

    setItemName("");
    setStartingPrice("");
    toast.success("Your item is ready to sell!");
  };

  const handleModalClose = () => {
    setShowModal(false);
  };
  const handleButtonClick = () => {
    navigate("/bidder");
  };
  const handleNameChange = (event) => {
    if (showValidation) {
      setShowValidation(false);
    }
    setAuctioneerName(event.target.value);
  };
  const handleAuctionStatus = async (status) => {
    const data = {
      id: auctions.length > 0 && auctions[0].id,
    };
    const updatedData = {
      status: status,
    };
    await api.put(`auctions/${data.id}`, updatedData);
    setAuctionStatus(true);

    setTimeout(() => {
      setAuctionStatus(false);
    }, [1000]);
  };

  const handleStartButtonClick = async (event) => {
    event.preventDefault();
    const data = {
      id: auctions.length > 0 && auctions[0].id,
    };
    const updatedData = {
      status: "pending",
      buttonStatus: "Start",
    };
    await api.put(`auctions/${data.id}`, updatedData);
    setAuctionStatus(true);

    setTimeout(() => {
      setAuctionStatus(false);
    }, [1000]);
  };

  const handleStopButtonClick = async (event) => {
    // event.preventDefault()
    const data = {
      id: auctions.length > 0 && auctions[0].id,
    };
    const updatedData = {
      status: "pending",
      buttonStatus: "Stop",
    };
    await api.put(`auctions/${data.id}`, updatedData);
    setAuctionStatus(true);

    setTimeout(() => {
      setAuctionStatus(false);
    }, [1000]);
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
                <hr />
                {showValidation && (
                  <Alert variant="danger">Please enter your name.</Alert>
                )}

                <Form onSubmit={handleAuctioneerSubmit}>
                  <Form.Group controlId="auctioneerName" className="mb-4">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={auctioneerName}
                      onChange={handleNameChange}
                    />
                  </Form.Group>
                  <Row>
                    <Col>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoggingIn}
                        className="all-button"
                      >
                        {isLoggingIn ? (
                          <>
                            <Spinner animation="border" size="sm" /> Logging
                            in...
                          </>
                        ) : (
                          "Auction Login"
                        )}
                      </Button>
                    </Col>
                    <Col>
                      {/* <Link className="bidder-buttton" to="/bidder">
                        Bidder Login
                      </Link> */}
                      <Button
                        className="all-button"
                        onClick={handleButtonClick}
                      >
                        Bidder Login
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <ToastContainer position="top-right" autoClose={2000} />
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
                  <Form.Label>Your Name </Form.Label>
                  <Form.Label className="product-name">
                    {" "}
                    {auctioneerName}
                  </Form.Label>
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
                  onClick={
                    auctions.length === 0
                      ? handleModalSubmit
                      : handleStartButtonClick
                  }
                  disabled={
                    auctions.length === 0
                      ? false
                      : auctions[0]?.buttonStatus === "Start"
                      ? true
                      : false
                  }
                >
                  Start Auction
                </Button>
                <Button
                  className="stop-button"
                  variant="danger"
                  type="button"
                  onClick={() => handleStopButtonClick()}
                  disabled={
                    auctions.length === 0
                      ? false
                      : auctions[0]?.buttonStatus === "Stop"
                      ? true
                      : auctions[0].status !== "pending" && true
                  }
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
            <Modal.Footer>
              <Button
                variant="danger"
                disabled={
                  auctions.length === 0
                    ? true
                    : auctions[0].status !== "pending" && true
                }
                onClick={() => handleAuctionStatus("no_sale")}
              >
                NO SALE
              </Button>
              <Button
                variant="success"
                disabled={
                  auctions.length === 0
                    ? true
                    : auctions[0].status !== "pending" && true
                }
                onClick={() => handleAuctionStatus("sold")}
              >
                SOLD
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </Container>
  );
};

export default Auction;
