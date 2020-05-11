var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var users = {}  //To store username as key and socket id as value;
		//to retrive to_send user id to send message

var reverse_users = {}  //To store socket id as key and username as value;
			//to retrive sender name
var user;

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//To Create Server
var server = app.listen(process.env.PORT||3000, ()=>{
	console.log("Server Listening at http://localhost:3000");
	});

const io = require('socket.io').listen(server);


//Connection
io.on('connection', (socket)=>{
	users[user] = socket.id;
	reverse_users[socket.id] = user;
	console.log(user, " Connected");
	socket.on('client', (msg)=>{
	
		//To seperate name from '@'
		var mentioned_user_with_sign = msg.user;
		var mentioned_user = mentioned_user_with_sign.split('@')[1]

	//	console.log("USERS: ",users);
		var message = msg.message;
		var send_message = {
			user : reverse_users[socket.id],
			message : message
		};

		//To Broadcast message to desire user.
		if(users[mentioned_user] != undefined)
			socket.to(users[mentioned_user]).emit('server', send_message)
	});
	socket.on('disconnect', (data)=>{
		
		socket.disconnect();
	});
});



//To render HomePage i.e., to enter username
app.get('/', (req, res, next)=>{
	res.render('home.ejs');
});


//To render Chat HomePage;
app.get('/chat/enter', (req, res, next)=>{

	user = req.query.user;
	res.render('chat.ejs');

});
