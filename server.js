var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
var dbfile = "database.db";
var existed = fs.existsSync(dbfile); 
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbfile);

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.get("/chatroom", function(req, res) {
	res.sendFile(__dirname + "/chatroom.html");
	// TODO: get chatroom before enter name
});

app.get("/style.css", function(req, res) {
	res.sendFile(__dirname + "/style.css");
});

db.serialize(function() {
	if (!existed) {
		db.run("CREATE TABLE chatHistory (name TEXT, message TEXT, time TEXT)");
	}
});

io.on("connection", function(socket) {
	//TODO: handle name existed case
	socket.on("join", function(name) {
		socket.nickname = name; // sets the name associated with this client
		// announces new user
		socket.broadcast.emit("newUser", name);
		socket.emit("newUser", name);

		// loads chat history
		db.serialize(function() {
			if (existed) {
				db.each("SELECT * FROM chatHistory", function(err, row) {
					socket.emit("message", row.name, row.message, row.time);
				});
			}
		});
	});

	socket.on("newMessage", function(message) {
		var time = getTimeString();
		socket.broadcast.emit("message", socket.nickname, message, time);
		socket.emit("message", socket.nickname, message, time);
		// saves message into database
		db.serialize(function() {
			db.run("INSERT into chatHistory (name, message, time)" +
				" VALUES (?, ?, ?)", socket.nickname, message, time);
		});
	});

	socket.on("disconnect", function() {
		socket.broadcast.emit("exit", socket.nickname);
	});
});

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

server.listen(8080);
//db.close();