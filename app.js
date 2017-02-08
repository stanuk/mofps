//Initialize a server
var express = require('express'); //used for file i/o
var app = express();
var server = require('http').Server(app);
var world = require('./server/js/server_world');

//only allow access to the client folder
app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

app.get('/client/js/client_world.js', function(req, res){
	res.sendFile(__dirname + '/client/js/client_world.js');
});

//set it to listen to port 8000
//server.listen(8000);
var port = process.env.OPENSHIFT_NODEJS_PORT || 8000;
var ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
 
server.listen(port, ip_address, function(){
    console.log( "Listening on " + ip_address + ", server_port " + port );
});	
console.log('server started');

//setup socket i/o
var io = require('socket.io')(server, {});
io.on('connection', function(socket){ //if there is a connection
	console.log('socket connection');

	var id = socket.id;
	world.addPlayer(id);

	var player = world.playerFromId(id);
	socket.emit('createPlayer', player);

	socket.broadcast.emit('addOtherPlayer', player);

	socket.on('requestOldPlayers', function(){
		for(var i = 0; i < world.players.length; i++){
			if(world.players[i].playerId != id){
				socket.emit('addOtherPlayer', world.players[i]);
			}
		}
	});

	socket.on('updatePosition', function(data){
		var newData = world.updatePlayerData(data);
		socket.broadcast.emit('updatePosition', newData);
	})

	socket.on('disconnect', function(){
		console.log('user disconnected');
		io.emit('removeOtherPlayer', player);
		world.removePlayer(player);
	});
});