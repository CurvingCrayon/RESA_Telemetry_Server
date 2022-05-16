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

var FloatOutputs = ["speed", "voltage", "obstacle_dist", "power_pwm", "steer_pwm", "drive_pwm", "acc_x", "acc_y", "acc_z",  "x_rot", "y_rot", "z_rot", "emergency_stop", "steer_direction", "timestamp", "is_default"];
function NumberDisplay(props){
    return (
        <div style={{width:"25%", border: "1px solid rgb(200,200,200)", padding: "10px", margin:"5px", display:"inline-block"}}>
            <Form.Label>{props.name}</Form.Label>
            &nbsp; {props.value}
        </div>
    )
}
function SliderInput(props){
    const [val, setVal] = useState(props.defaultValue);
    const slider = useRef(null);
    useEffect(()=>{
        if(props.override){
            slider.value = 70;//val*100;
        }
    }, [props.val]);

    return(
        <div style={{width:"25%", border: "1px solid rgb(200,200,200)", padding: "10px", margin:"5px", display:"inline-block"}}>
            <Form.Label>{props.name}</Form.Label>
            <Form.Range ref={slider} defaultValue={props.defaultValue} name={props.var} onChange={(event)=>{props.updateVal(event.target.name, event.target.value/props.scaler); setVal(event.target.value/props.scaler)}} />
            <>{props.override ? props.val : val}</>
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

    const controllerTimerId = useRef(-1);
    const enableController = useRef(false);

    const [autoUpdate, setAutoUpdate] = useState(true);

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

    var nineState = 0;
    function checkController(){
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (var i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                var g = gamepads[i];
                // console.log(g.buttons);
                // console.log(g.axes);

                
                if(g.buttons[9].value != nineState && !nineState){ // Start button
                    enableController.current = !enableController.current; // Toggle controller enable
                    console.log("Controller enabled:    ");
                    console.log(enableController.current);
                }
                nineState = g.buttons[9].value;
                if(enableController.current){
                    updateVal("speed", 0.5 + g.buttons[7].value/2 - g.buttons[6].value/2);

                    updateVal("steer_direction", (g.axes[0] < -0.5) * -1 + (g.axes[0] > 0.5) * 1 );
                }
            }
        }
    }

	useEffect(()=>{ // On mount
		clearInterval(timerId.current);
		timerId.current = setInterval(() => {
			API.getState().then(newState=>{
				setState(newState);
			})
		}, 1000);

        clearInterval(controllerTimerId.current);
        controllerTimerId.current = setInterval(() => {
            checkController();
        }, 10);
	}, []);

	useEffect(()=>()=>{ // On unmount
		clearInterval(timerId.current);
        clearInterval(controllerTimerId.current);
	}, []);

	return (
        <div >
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
                <Form.Check type="checkbox" defaultChecked={true} label="Auto-send (automatically send updates when values are changed)" onChange={(event)=>{setAutoUpdate(event.target.checked)}} />
                    <SliderInput override={enableController.current} val={vals.speed} updateVal={updateVal} var={"speed"} name={"Driving PWM"} scaler={100} defaultValue={50} />
                    <SliderInput override={enableController.current} val={vals.steer_direction} updateVal={updateVal} var={"steer_direction"} name={"Steering PWM"} scaler={100} defaultValue={50} />
                    <SliderInput updateVal={updateVal} var={"stop_distance"} name={"Stopping distance"} scaler={20} defaultValue={0} />
                    <SliderInput updateVal={updateVal} var={"stop_accel"} name={"Stopping accel"} scaler={20} defaultValue={0} />
                    <CheckInput updateVal={updateVal} var={"autonomous_steer"} name={"Auto steering"} defaultValue={false} />
                </Card.Body>
            </Card>
                {/* <Speedo ringWidth={10}/> */}
            <div style={{height:"30px"}} />
            <Card style={{width:"60%"}}>
                <Card.Header as="h5">Data &nbsp; &nbsp;
                    
                </Card.Header>
                <Card.Body>
                {
                    FloatOutputs.map((name,index)=>(
                        <NumberDisplay name={name} value={state[name]} />
                    ))
                }
                
                
                    
                </Card.Body>
            </Card>
                
                
        </Container>
    </div>
	);
}

export default App;
