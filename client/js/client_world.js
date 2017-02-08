var container, scene, camera, renderer, objects = [];

var keyState = {};

var player, playerId, moveSpeed, turnSpeed;
var playerData;

var otherPlayers = [], otherPlayersId = [];

var sphere;

var loadWorld = function(){

	init();
	animate();

	function init(){
		container = document.getElementById('container');

		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 1000);
		camera.position.z = 5;

		renderer = new THREE.WebGLRenderer({alpha:true});
		renderer.setSize(window.innerWidth, window.innerHeight);

		//can add objects here
		var sphere_geometry = new THREE.SphereGeometry(1);
        var sphere_material = new THREE.MeshNormalMaterial();
        sphere = new THREE.Mesh( sphere_geometry, sphere_material );

        objects.push(sphere);
        scene.add(sphere);

		//events
		document.addEventListener('click', onClick, false);
		document.addEventListener('mouseDown', onMouseDown, false);
		document.addEventListener('mouseUp', onMouseUp, false);
		document.addEventListener('mousemove', onMouseMove, false);
		document.addEventListener('keydown', onKeyDown, false);
		document.addEventListener('keyup', onKeyUp, false);
		document.addEventListener('resize', onResize, false);
		
		container.appendChild(renderer.domElement);
		document.body.appendChild(container);
	}

	function animate(){
		requestAnimationFrame(animate);
		render();
	}

	function render(){

		if(player){
			updateCameraPosition();
			checkKeyStates();
			camera.lookAt(player.position);
		}

		renderer.clear();
		renderer.render(scene, camera);
	}

	function onClick(){
		//
	}

	function onMouseDown(){
		//
	}

	function onMouseUp(){
		//
	}

	function onMouseMove(){
		//
	}

	function onKeyDown(event){
		keyState[event.keyCode || event.which] = true;
	}

	function onKeyUp(event){
		keyState[event.keyCode || event.which] = false;
	}

	function onResize(){
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function calculateIntersects(event){
		event.preventDefault();

		var vector = new THREE.Vector3();
		vector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
		vector.unproject(camera);

		raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());

		var intersects = raycaster.intersectObjects(objects);

		return intersects;
	}
};

var createPlayer = function(data){

	playerData = data;

	var cube_geometry = new THREE.BoxGeometry(data.scaleX, data.scaleY, data.scaleZ);
	var cube_material = new THREE.MeshBasicMaterial({color: 0x38c38e, wireframe: false});
	player = new THREE.Mesh(cube_geometry, cube_material);

	player.rotation.set(0, 0, 0);
	player.position.set(data.x, data.y, data.z);

	playerId = data.playerId;
	moveSpeed = data.speed;
	turnSpeed = data.turnSpeed;

	updateCameraPosition();

	objects.push(player);
	scene.add(player);

	camera.lookAt(player.position);
};

var updateCameraPosition = function(){
	camera.position.x = player.position.x + 6 * Math.sin(player.rotation.y);
	camera.position.y = player.position.y + 6;
	camera.position.z = player.position.z + 6 * Math.cos(player.rotation.y);
};

var updatePlayerPosition = function(data){
	var otherPlayer = playerFromId(data.playerId);

	otherPlayer.position.set(data.x, data.y, data.z);
	otherPlayer.rotation.set(data.r_x, data.r_y, data.r_z);
};

var updatePlayerData = function(){
	playerData.x = player.position.x;
	playerData.y = player.position.y;
	playerData.z = player.position.z;

	playerData.r_x = player.rotation.x;
	playerData.r_y = player.rotation.y;
	playerData.r_z = player.rotation.z;
};

var checkKeyStates = function(){
	if(keyState[38] || keyState[87]){
		//up or W - move forward
		player.position.x -= moveSpeed * Math.sin(player.rotation.y);
		player.position.z -= moveSpeed * Math.cos(player.rotation.y);
		updatePlayerData();
		socket.emit('updatePosition', playerData);
	}
	if(keyState[40] || keyState[83]){
		//down or S - move backward
		player.position.x += moveSpeed * Math.sin(player.rotation.y);
		player.position.z += moveSpeed * Math.cos(player.rotation.y);
		updatePlayerData();
		socket.emit('updatePosition', playerData);
	}
	if(keyState[37] || keyState[65]){
		//left or A - strafe left
		player.position.x -= moveSpeed * Math.cos(player.rotation.y);
		player.position.z += moveSpeed * Math.sin(player.rotation.y);
		updatePlayerData();
		socket.emit('updatePosition', playerData);
	}
	if(keyState[39] || keyState[68]){
		//right or D - strafe right
		player.position.x += moveSpeed * Math.cos(player.rotation.y);
		player.position.z -= moveSpeed * Math.sin(player.rotation.y);
		updatePlayerData();
		socket.emit('updatePosition', playerData);
	}
	if(keyState[81]){
		//Q - rotate left
		player.rotation.y += turnSpeed;
		updatePlayerData();
		socket.emit('updatePosition', playerData);
	}
	if(keyState[69]){
		//E = rotate right
		player.rotation.y -= turnSpeed;
		updatePlayerData();
		socket.emit('updatePosition', playerData);
	}
};

var addOtherPlayer = function(data){
	var cube_geometry = new THREE.BoxGeometry(data.scaleX, data.scaleY, data.scaleZ);
	var cube_material = new THREE.MeshBasicMaterial({color: 0xc38e38, wireframe: false});
	var otherPlayer = new THREE.Mesh(cube_geometry, cube_material);

	otherPlayer.position.set(data.x, data.y, data.z);

	otherPlayersId.push(data.playerId);
	otherPlayers.push(otherPlayer);
	objects.push(otherPlayer);
	scene.add(otherPlayer);
};

var removeOtherPlayer = function(data){
	scene.remove(playerFromId(data.playerId));
};

var playerFromId = function(id){
	var index;
	for(var i = 0; i < otherPlayersId.length; i++){
		if(otherPlayersId[i] == id){
			index = i;
			break;
		}
	}
	return otherPlayers[index];
}