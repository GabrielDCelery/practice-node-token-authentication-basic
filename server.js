var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');

var User = require('./app/models/user');
var config = require('./config');

var app = express();
var port = process.env.PORT || 3000;

mongoose.connect(config.database);

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.get('/setup', function (req, res){
	var gabriel = new User({
		name: 'Gabriel',
		password: 'kuhpw894',
		admin: true
	})

	gabriel.save(function (err){
		if(err) throw err;
		console.log('User saved successfully');
		res.json({success:true});
	})
})

var apiRoutes = express.Router();

apiRoutes.get('/', function (req, res){
	res.json({message: 'Welcome to the coolest API on the World!'});
})

apiRoutes.get('/users', function (req, res){
	User.find({}, function (err, users){
		res.json(users);
	})
})

apiRoutes.post('/authenticate', function (req, res){
	User.findOne({name: req.body.name}, function (err, user){
		if(err) throw err;
		if(!user){
			res.json({success: false, message: 'Authentication failed, user not found'});
		} else if(user){
			if(user.password != req.body.password){
				res.json({success: false, message: 'Authentication failed, wrong password'})
			} else {
				var token = jwt.sign(user, app.get('superSecret'), {expiresInMinutes: 1440});
				res.json({ success: true, message: 'Enjoy your token!', token: token});
			}
		}
	})
})


app.use('/api', apiRoutes);

app.listen(port);

console.log('Magic happens at http://localhost:' + port);