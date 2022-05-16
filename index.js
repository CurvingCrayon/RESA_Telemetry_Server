/**
 * Entry point of back-end system. Contains HTTP/S listeners.
 * @module index
 */
var fs = require('fs');
const url = require('url');
// const chalk = require('chalk');

process.env.NODE_ENV = (process.env.NODE_ENV || "").trim();

const port = process.env.PORT || 80;

const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
const state = require('./node/state.js');
const command = require('./node/command.js');
const cors = require('cors');

app.use(cors());
app.use(express.urlencoded());
app.use(function(req,res,next){
	console.log(req.body);
	next();
});
app.use(express.json());

app.use('/command', function(req, res){
    console.log(req.body);
    command.update(req.body);
    res.status(200).json({
        "success": true
    })
});


app.get('/read', function(req, res){
    // console.log("Read from IP " + req.ip);
    try{
        var currState = state.get(true);
        currState.success = true;
        res.status(200).send(currState);
    }
    catch(e){
        console.error("Error when reading from IP " + req.ip + ", " + e.message);
        res.status(500).send({
            success: false,
            err: e.message
        })
    }
});

app.post('/mcu', function(req, res){
    console.log("Read from IP " + req.ip);
    try{
		console.log(req.body);
		state.update(req.body);
        res.status(200).json(command.get());
    }
    catch(e){
        console.error("Error when reading from IP " + req.ip + ", " + e.message);
        res.status(500).json({
            success: false,
            err: e.message
        })
    }
});

app.use("/", express.static("build"));

var httpServer = http.createServer(app);




// console.log(chalk.yellow("Beginning initialization process."));
httpServer.listen(port, ()=>{
    // console.log(chalk.green("HTTP Server started on port " + port));
    console.log("HTTP Server started on port " + port);
});




