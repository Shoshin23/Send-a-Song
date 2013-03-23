
/**
 * Module dependencies.
 */

var config = {
	port: process.env.VMC_APP_PORT || 8080,

	title: "Tring",
//Get Account info twilio and soundcloud.
	twilio: {
		account_sid: "xxx", 
		auth_token: "xxx",
		number: "xxx"
	},

	soundcloud: {
		id: "xxx"
	}
};


var express = require('express')
  //, routes = require('./routes')
  //, user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , request = require('request')
  , util = require('util')
  , Twilio = require('twilio-js')

  //Setting up Twilio Auth Deails
  //Get your Twilio account details and sub them in config

  Twilio.AccountSid = config.twilio.account_sid;
  Twilio.AuthToken = config.twilio.auth_token;



var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//Get Soundcloud id from Soundcloud URL given by the user.
//
function getSoundcloudIDfromURL(url,callback) {
	var url = "https://api.soundcloud.com/resolve.json?client_id="+config.soundcloud.id+"&url="+url;
	request({url:url,json:true},function(error,response,data) {
		if(!error && response.statusCode == 200) {
			callback(data.id);
		}
	})
}

//Render the page

app.get("/",function(req,res) {
	var socketID = Math.random()*1000000000 + (new Date()).getTime();

	//if form has been submitted
	if(req.query.url !== undefined) {
		var url = req.query.url

	//get id from the url
	getSoundcloudIDfromURL(url,function(id) {
		
		//create the phone call
		var url = "http://wemakeawesomesh.it/soundcloudID/twiml.php?id="+id+"&socket_id="+socketID; 
		Twilio.Call.create({
			to: req.query.to,
			from:config.twilio.number, //your Twilio account number
			url: url
		}, function(e) {
			res.render('index',{title: config.title, phonecall: true, socketID: socketID})
		});
	})
	}
	else {
		res.render('index', {title: config.title, phonecall: false})
	}
})

//app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
