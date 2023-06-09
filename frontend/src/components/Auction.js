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
import { createAuction, getAuction, getBids, login } from "../action";
import "./style.css";
import Bidder from "./Bidder";

const Auction = () => {
    const [auctioneerName, setAuctioneerName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [itemName, setItemName] = useState("");
    const [startingPrice, setStartingPrice] = useState("");
    const [userType, setUserType] = useState();
    const [auctions, setAuctions] = useState([]);
    const [bidders, setBidders] = useState([]);

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
                        <Bidder />
                    </Col>
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
            </div>
        </Container>
    );
};

export default Auction;
