var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
//var bodyParser = require('body-parser');
//app.use(bodyParser.urlencoded({
//	extended: true
//}));

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.get("/chatroom", function(req, res) {
	//var name = req.params.name;
	//console.log(name);
	res.sendFile(__dirname + "/chatroom.html");
	// TODO 
});

app.get("/style.css", function(req, res) {
	res.sendFile(__dirname + "/style.css");
});

/*app.post("/chatroom", function(req, res) {
	var name = req.body.name;
	res.sendFile(__dirname + "/chatroom.html");
	io.sockets.emit("newUser", name);
});*/

io.on("connection", function(socket) {
	socket.on("join", function(name) {
		socket.nickname = name; // sets the name associated with this client
		socket.broadcast.emit("newUser", name);
		socket.emit("newUser", name);
	});

	socket.on("message", function(message) {
		var name = socket.nickname;
		var time = getTimeString();
		socket.broadcast.emit("newMessage", name, message, time);
		socket.emit("newMessage", name, message, time);
	});

	socket.on("disconnect", function(name) {
		socket.broadcast.emit("exit", name);
	});
});

server.listen(8080);

// TODO: format
function getTimeString() {
	var date = new Date();
	var ret = date.getMonth() + "." + date.getDate() + "." + date.getFullYear() + " ";
	var time = date.getHours();
	if (time < 12) {
		ret += time + ":" + date.getMinutes() + "AM"; 
	} else {
		if (time > 12) {
			time -= 12;
		}
		ret += time + ":" + date.getMinutes() + "PM";
	}

	return ret;
}