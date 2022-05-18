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
import {LineChart, XAxis, YAxis, Legend, Tooltip, CartesianGrid, Line} from 'recharts';

import './App.css';

import * as API from './API';

function Chart(props){
    return (
        <LineChart
            width={400}
            height={400}
            data={props.data}
            >
            <YAxis domain={['dataMin', dataMax => (Math.max(dataMax, 1))]} />
            <XAxis dataKey="time" />
            <Tooltip />
            <CartesianGrid stroke="#f5f5f5" />
            <Line type="monotone" dataKey="val" stroke="#ff7300" yAxisId={0} isAnimationActive={false} />
            </LineChart>
    )
}
var FloatOutputs = ["speed", "voltage", "obstacle_dist", "power_pwm", "steer_pwm", "drive_pwm", "acc_x", "acc_y", "acc_z",  "x_rot", "y_rot", "z_rot", "emergency_stop", "steer_direction", "timestamp", "is_default"];
function NumberDisplay(props){
    return (
        <div onClick={()=>{props.addPlot(props.name)}} style={{width:"25%", border: "1px solid rgb(200,200,200)", padding: "10px", margin:"5px", display:"inline-block"}}>
            <Form.Label>{props.name}</Form.Label>
            &nbsp; {props.value}
        </div>
    )
}
function SliderInput(props){
    const [val, setVal] = useState((props.defaultValue-props.offset)/props.scaler);
    const slider = useRef(null);

    function c(val){
        var dz = (props.deadzone ? props.deadzone : 0);
        val = (val - props.offset)/props.scaler;
        if(val < dz && val > -dz){
            val = 0;
        }
        return val;
    }
    function invc(val){
        return val*props.scaler +   props.offset;
    }

    return(
        <><div style={{width:"25%", border: "1px solid rgb(200,200,200)", padding: "10px", margin:"5px", display:"inline-block"}}>
            <Form.Label>{props.name}</Form.Label>
            <Form.Range ref={slider} value={invc(val)} defaultValue={props.defaultValue} name={props.var} onChange={(event)=>{props.updateVal(event.target.name, c(event.target.value)); setVal(c(event.target.value))}} />
            <>{props.override ? Math.round(props.val*props.dispScaler*10)/10 : Math.round(val*props.dispScaler*10)/10}</>
            &nbsp; &nbsp;
            <>
                {(props.zero ?
                    <Button onClick={(event)=>{
                        setVal(0);
                        props.updateVal(props.var, 0);
                        
                    }}>Zero</Button>
                :
                <></>)}
            </>
        </div>
       
        </>
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

    const [data, setData] = useState([]);
    const tVal = useRef("speed");

    const [logs, setLogs] = useState([]);

	const timerId = useRef(-1);
	const nav = useRef();

    const controllerTimerId = useRef(-1);
    const enableController = useRef(false);

    const [autoUpdate, setAutoUpdate] = useState(true);


    function updateLogs(){
        API.getVar("uno_debug_msg").then((results)=>{
            // Reformat data
            console.log(results);
            var data = [];
            var max = results[1][results[1].length-1];
            for(var i = 0; i < results[0].length; i++){
                if(results[1][i] && results[1][i] > max - 60000){
                    data.push({
                        time: results[1][i],
                        val:  results[0][i]
                    });
                }
            }
            console.log(data);
            setLogs(data);
            
        }).catch(err=>{
            console.log(err);
        })
    }
    function updatePlot(){
        var key = tVal.current;
        console.log(key);
        API.getVar(key).then((results)=>{
            // Reformat data
            console.log(results);
            var data = [];
            var max = results[1][results[1].length-1];
            for(var i = 0; i < results[0].length; i++){
                if(results[1][i] && results[1][i] > max - 60000){
                    data.push({
                        time: results[1][i],
                        val:  results[0][i]
                    });
                }
            }
            setData(data);
            console.log(data);
        }).catch(err=>{
            console.log(err);
        })
    }
    function addPlot(key){
        tVal.current = key;
    }

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
                    alert("Controller enabled: " +  String(enableController.current));
                }
                nineState = g.buttons[9].value;
                if(enableController.current){
                    updateVal("speed", (g.buttons[7].value/2 - g.buttons[6].value/2)*2);

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
            updatePlot();
            updateLogs();
		}, 1000);

        clearInterval(controllerTimerId.current);
        controllerTimerId.current = setInterval(() => {
            checkController();
        }, 100);
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
                    <SliderInput override={enableController.current} val={vals.speed} updateVal={updateVal} var={"speed"} name={"Speed setpoint (m/s)"} dispScaler={8.3} scaler={50} defaultValue={50} offset={50} deadzone={0} zero={true} />
                    <SliderInput override={enableController.current} val={vals.steer_direction} updateVal={updateVal} var={"steer_direction"} name={"Steering PWM"} dispScaler={1} scaler={50} defaultValue={50} offset={50} />
                    <SliderInput updateVal={updateVal} var={"stop_distance"} name={"Stopping distance"} scaler={20} defaultValue={0} dispScaler={1} offset={0} />
                    <SliderInput updateVal={updateVal} var={"stop_accel"} name={"Stopping accel"} scaler={20} defaultValue={0} dispScaler={1} offset={0} />
                    <CheckInput updateVal={updateVal} var={"autonomous_steer"} name={"Auto steering"} defaultValue={false} dispScaler={1} offset={0} />
                </Card.Body>
            </Card>

            <div style={{position:"absolute", top:0, right:0}}>
                <Speedo  currentValueText={"Measured Speed (rad/s): ${value}"} value={Math.abs(state.speed)} minValue={0} maxValue={8} ringWidth={10} startColor={"#FFFFFF"} endColor={"#00FF00"} />
                <h5>{tVal.current}</h5>
                <Chart data={data} />
            </div>
            
            <div style={{height:"30px"}} />
            <Card style={{width:"60%"}}>
                <Card.Header as="h5">Data &nbsp; &nbsp;
                    
                </Card.Header>
                <Card.Body>
                {
                    FloatOutputs.map((name,index)=>(
                        <NumberDisplay addPlot={addPlot} name={name} value={state[name]} />
                    ))
                }
                
                
                    
                </Card.Body>
            </Card>

            <Card style={{width:"60%"}}>
                <Card.Header as="h5">Debug output
                    
                </Card.Header>
                <Card.Body>
                    <div style={{maxHeight:"300px", overflow: "auto", backgroundColor:  "black"}}>
                        {
                            logs.map((val, index)=>(
                                (
                                    val.val !== '' ?
                                    <p style={{color:   "#00FF00", margin:0}}>{"[" +   String(val.time) +"]" + val.val}</p>
                                    :
                                    <></>
                                )
                                
                            ))
                        }
                    </div>
                
                
                    
                </Card.Body>
            </Card>
                
                
        </Container>
    </div>
	);
}

export default App;
