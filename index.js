var gomusic  = require('express')();
var http = require('http').Server(gomusic);
var io = require('socket.io')(http);
var clients = [];

gomusic.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('new user', function (data, callback){
		if (clients.indexOf(data) != -1) {
			callback(false);
		}
		else {
			callback(true);
			socket.nickName = data;
			clients.push(socket.nickName);
            updateNickName();
		}
	});

    socket.on('disconect', function(data) {
        if (!socket.nickName) {
            return;
        }
        clients.splice(clients.indexOf(socket.nickName), 1);
        updateNickName();

    });

	socket.on('chat message', function(data){
		io.emit('chat message', {msg: data, username: socket.nickName});
	});

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

function updateNickName() {
    io.emit('usernames', clients);
}
