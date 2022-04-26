var LastCommand = {
	speed: 0.5,
	autonomous_steer: 0,
	steer_direction: 0.5,
	stop_distance: 0,
	stop_accel: 0,
	
    timestamp: 0,
	is_default: 1,
};
function boolCast(val){
	return val === "true";
}
var Casts = {
	speed: Number,
	autonomous_steer: Number,
	steer_direction: Number,
	timestamp: Number,
	is_default: Number,
}
module.exports.update = function(obj){
	// Copy over props without deleting unchanged properties
	var d = new Date();
	for(prop in obj){
		if(Casts[prop]){
			LastCommand[prop] = Casts[prop](obj[prop]);
		}
		else{
			LastCommand[prop] = obj[prop];
		}
	}
	LastCommand.is_default = 0;
    LastCommand.timestamp = d.getTime();
}
module.exports.set = function(prop, value){
	if(Casts[prop]){
		LastCommand[prop] = Casts[prop](obj[prop]);
	}
	else{
		LastCommand[prop] = obj[prop];
	}
	LastCommand.is_default = 0;
}
module.exports.get = function(){
    var tempState = JSON.parse(JSON.stringify(LastCommand));
    return tempState;
}
module.exports.getString = function(){
    return JSON.stringify(LastCommand);
}