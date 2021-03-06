var States = [];
var CurrentState = {
    lastUpdate: new Date(),
};
module.exports.update = function(obj){
    CurrentState = obj;
    CurrentState.lastUpdate = new Date();
    States.push(obj);
    States.slice(Math.max(States.length - 100, 0)); // Only take last 100 entries
}
module.exports.get = function(formatTime){
    var tempState = JSON.parse(JSON.stringify(CurrentState));
    if(formatTime){
        tempState.lastUpdate = CurrentState.lastUpdate.getTime();
    }
    return tempState;
}
module.exports.getVal = function(key){
    var vals = [];
    var times = [];
    for(var i = 0; i < States.length; i++){
        vals.push(States[i][key]);
        times.push(States[i].timestamp);
    }
    return [vals,times];
}
module.exports.getString = function(){
    var tempState = JSON.parse(JSON.stringify(CurrentState));
    tempState.lastUpdate = String(CurrentState.lastUpdate.getTime());
    return JSON.stringify(tempState);
}