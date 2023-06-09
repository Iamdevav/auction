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
import { createAuction, login } from "../action";

const Auction = () => {
    const [auctioneerName, setAuctioneerName] = useState("");
    const [bidderName, setBidderName] = useState("")
    const [showModal, setShowModal] = useState(false);
    const [itemName, setItemName] = useState("");
    const [startingPrice, setStartingPrice] = useState("");
    const [userType, setUserType] = useState()

    const dispatch = useDispatch()

    useEffect(() => {

    }, [])

    const handleAuctioneerSubmit = (event) => {
        event.preventDefault();
        let data
        if (auctioneerName) {
            setUserType('Auctioneer')
            data = {
                name: auctioneerName,
                userType: 'Auctioneer'
            }

        } else {
            setUserType('Bidder')
            data = {
                name: bidderName,
                userType: 'Biddder'
            }
        }
        dispatch(login(data))
        setAuctioneerName("")
        setBidderName("")
        setShowModal(true);
    };

    const handleModalSubmit = (event) => {
        event.preventDefault();
        console.log("Item Name:", itemName);
        console.log("Starting Price:", startingPrice);
        // Do any additional logic here
        const data = {
            name: itemName,
            price: startingPrice
        }
        dispatch(createAuction(data))

        // Clear the form fields if needed
        setItemName("");
        setStartingPrice("");
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    return (
        <Container>
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
                                <Form onSubmit={handleAuctioneerSubmit}>
                                    <Form.Group controlId="bidderName" className="mb-3">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control type="text" placeholder="Enter name" value={bidderName} onChange={(event) => setBidderName(event.target.value)} />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        Submit
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {userType === "Auctioneer" && <Modal
                    show={showModal}
                    onHide={handleModalClose}
                //   style={{ height: "500vh" }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Enter Item Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="itemName">
                                <Form.Label>Auction Name</Form.Label>
                            </Form.Group>
                            <Form.Group controlId="itemName">
                                <Form.Label>Item Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter item name"
                                    value={itemName}
                                    onChange={(event) => setItemName(event.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId="startingPrice" className="mb-3">
                                <Form.Label>Starting Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter starting price"
                                    value={startingPrice}
                                    onChange={(event) => setStartingPrice(event.target.value)}
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                onClick={handleModalSubmit}
                            >
                                Submit
                            </Button>
                            <hr />
                            <p> current price</p>
                            <Row className="gx-0">
                                <Col>
                                    <p>Bidder Name:</p>
                                </Col>
                                <Col>
                                    <p>$XXX</p> {/* Replace XXX with the actual current price */}
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                </Modal>}
            </div>
        </Container>
    );
};

export default Auction;
