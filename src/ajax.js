/**
 * Module for communication with back-end.
 * @module ajax
 */

/**
 * Change the port of a URL.
 * @param  {string} url
 * @param  {string} newPort
 */
 function changePort(url, newPort){
    var colonIndex = url.lastIndexOf(":");
    if(colonIndex == -1){ // If the URL does not have a port setting
        return url + ":" + String(newPort);
    }
    var firstPart = url.substring(0, colonIndex);
    return firstPart + ":" + String(newPort);
}

var URL;
if(process.env.NODE_ENV === "production"){
    URL = (process.env.REACT_APP_API_URL || location.origin);
}else{
    URL = (process.env.REACT_APP_API_URL || changePort(location.origin, 80));
} 
var TIMEOUT = 5000;

/**
 * Sends a GET request over HTTP/S and parses the JSON response.
 * @param  {string} url
 * @param  {object[]} headers Request headers. Objects contain "name" and "content" fields.
 * @return {promise<object>} Request status. Includes "success", "statusCode", "status" and "resp" fields.
 */
export function getJSONFromURL(url, headers, body){
    url = URL + url;
    return new Promise((resolve, reject)=> {
        var xhttp = new XMLHttpRequest();
        xhttp.responseType = "json";
        
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                var statusMessage = "";

                if(this.status === 0){
                    statusMessage = "Could not contact bollard control server.";
                }

                resolve({
                    success: this.status == 200,
                    statusCode: this.status,
                    status: statusMessage,
                    resp: this.response
                });
                
            }
        };
        xhttp.open("GET", url, true);
        //load headers
        for(var i = 0; i < headers.length; i++){
            xhttp.setRequestHeader(headers[i].name, headers[i].content);
        }
        xhttp.timeout = TIMEOUT;
        xhttp.ontimeout = function(){
            resolve({
                success: false,
                err: "Response timed out"
            });
        }
        if(body === undefined){
            xhttp.send();
        }
        else{
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp.send(body);
        }
    });
}

export function postURL(url, headers, body){
    url = URL + url;
    return new Promise((resolve, reject)=> {
        var xhttp = new XMLHttpRequest();
        xhttp.responseType = "json";
        
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                var statusMessage = "";

                if(this.status === 0){
                    statusMessage = "Could not contact bollard control server.";
                }

                resolve({
                    success: this.status == 200,
                    statusCode: this.status,
                    status: statusMessage,
                    resp: this.response
                });
                
            }
        };
        xhttp.open("POST", url, true);
        //load headers
        for(var i = 0; i < headers.length; i++){
            xhttp.setRequestHeader(headers[i].name, headers[i].content);
        }
        xhttp.timeout = TIMEOUT;
        xhttp.ontimeout = function(){
            resolve({
                success: false,
                err: "Response timed out"
            });
        }
        if(body === undefined){
            xhttp.send();
        }
        else{
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp.send(body);
        }
    });
}