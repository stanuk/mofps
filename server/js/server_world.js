var players = [];

function Player(){
	this.playerId = players.length;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.rx = 0;
	this.ry = 0;
	this.rz = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.scaleZ = 1;
	this.speed = 0.1;
	this.turnSpeed = 0.03;
}

var addPlayer = function(id){
	var player = new Player();
	player.playerId = id;
	players.push(player);

	return player;
};

var removePlayer = function(player){
	var index = players.indexOf(player);

	if(index > -1){
		players.splice(index, 1);
	}
};

var updatePlayerData = function(data){
	var player = playerFromId(data.playerId);

	player.x = data.x;
	player.y = data.y;
	player.z = data.z;
	player.r_x = data.r_x;
	player.r_y = data.r_y;
	player.r_z = data.r_z;

	return player;
};

var playerFromId = function(id){
	var player;
	for(var i = 0; i < players.length; i++){
		if(players[i].playerId === id){
			player = players[i];
			break;
		}
	}
	return player;
};

module.exports.players = players;
module.exports.addPlayer = addPlayer;
module.exports.removePlayer = removePlayer;
module.exports.updatePlayerData = updatePlayerData;
module.exports.playerFromId = playerFromId;