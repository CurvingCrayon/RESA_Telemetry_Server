var CurrentState = {
    lastUpdate: new Date(),
};
module.exports.update = function(obj){
    CurrentState = obj;
    CurrentState.lastUpdate = new Date();
}
module.exports.get = function(formatTime){
    var tempState = JSON.parse(JSON.stringify(CurrentState));
    if(formatTime){
        tempState.lastUpdate = CurrentState.lastUpdate.getTime();
    }
    return tempState;
}
module.exports.getString = function(){
    var tempState = JSON.parse(JSON.stringify(CurrentState));
    tempState.lastUpdate = String(CurrentState.lastUpdate.getTime());
    return JSON.stringify(tempState);
}