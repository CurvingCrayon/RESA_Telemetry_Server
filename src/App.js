"use strict";
/**
 * Module for containing react App
 * @module App
 */
import * as React from 'react';
import{ createElement, useState, useEffect, useRef } from 'react';
import react, {Navbar, Nav, Button, Image, Card, ListGroup, Form} from 'react-bootstrap';

import Container from 'react-bootstrap/Container';
import Speedo from 'react-d3-speedometer';

import './App.css';

import * as API from './API';

function SliderInput(props){
    const [val, setVal] = useState(props.defaultValue);
    return(
        <div style={{width:"25%", border: "1px solid rgb(200,200,200)", padding: "10px", margin:"5px", display:"inline-block"}}>
            <Form.Label>{props.name}</Form.Label>
            <Form.Range defaultValue={props.defaultValue} name={props.var} onChange={(event)=>{props.updateVal(event.target.name, event.target.value/props.scaler); setVal(event.target.value/props.scaler)}} />
            <>{val}</>
        </div>
    )
}
function CheckInput(props){
    const [val, setVal] = useState(props.defaultValue);
    return(
        <div style={{verticalAlign:"top", width:"25%", border: "1px solid rgb(200,200,200)", padding: "10px", margin:"5px", display:"inline-block"}}>
            <Form.Label>{props.name}</Form.Label>
            <Form.Check type="checkbox" defaultChecked={props.defaultValue} name={props.var} label={props.name} onChange={(event)=>{props.updateVal(event.target.name, event.target.checked*1); setVal(event.target.checked*1)}} />
            <>{val}</>
        </div>
    )
}
/**
 * Container for React App.
 */
function App(){ 
	const [state, setState] = useState({});
    const [vals, setVals] = useState({});

	const timerId = useRef(-1);
	const nav = useRef();

    const [autoUpdate, setAutoUpdate] = useState(false);

	function getTimeString(time){
		var d = new Date(time);
		return d.toLocaleDateString() + " " + d.toLocaleTimeString();
	}

    function updateVal(key, value){
        var tempVals = vals;
        tempVals[key] = value;
        setVals(tempVals);
        if(autoUpdate){
            API.sendValues(vals);
        }
    }
	useEffect(()=>{ // On mount
		clearInterval(timerId.current);
		timerId.current = setInterval(() => {
			API.getState().then(newState=>{
				setState(newState);
			})
		}, 1000);
	}, []);

	useEffect(()=>()=>{ // On unmount
		clearInterval(timerId.current);
	}, []);

	return (
        <>
        <Navbar bg="light" fixed="top" expand="md" ref={nav}>   
            <Navbar.Brand>Electric Vehicle Dashboard</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Nav >
                <Nav.Link>IP address: </Nav.Link>
                <Nav.Link>Status: </Nav.Link>
                <Nav.Link>Last Updated: {getTimeString(state.lastUpdate)}</Nav.Link>
            </Nav>
            <Navbar.Collapse id="basic-navbar-nav">
                <div  className="mr-auto" />
            </Navbar.Collapse>
        </Navbar>
        <Container fluid="true" style={{margin:"10px", position: "relative", top: (nav.current || {offsetHeight:0}).offsetHeight}}>

            <Card style={{width:"60%"}}>
            <Card.Header as="h5">Controls &nbsp; &nbsp;
                <Button>Send</Button>
                
            </Card.Header>
            <Card.Body>
            <Form.Check type="checkbox" defaultChecked={false} label="Auto-send (automatically send updates when values are changed)" onChange={(event)=>{setAutoUpdate(event.target.checked)}} />
                <SliderInput updateVal={updateVal} var={"speed"} name={"Driving PWM"} scaler={100} defaultValue={50} />
                <SliderInput updateVal={updateVal} var={"steer_direction"} name={"Steering PWM"} scaler={100} defaultValue={50} />
                <SliderInput updateVal={updateVal} var={"stop_distance"} name={"Stopping distance"} scaler={20} defaultValue={0} />
                <SliderInput updateVal={updateVal} var={"stop_accel"} name={"Stopping accel"} scaler={20} defaultValue={0} />
                <CheckInput updateVal={updateVal} var={"autonomous_steer"} name={"Auto steering"} defaultValue={false} />
            </Card.Body>
            </Card>
                {/* <Speedo ringWidth={10}/> */}
                
                
        </Container>
    </>
	);
}

export default App;
