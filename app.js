
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , opts = require('opts')
	, config = require('config');

opts.parse([{
	short: 'p',
	long: 'port',
	description: 'server listen port.',
	value: true
}]);

var app = express();

app.configure(function(){
  app.set('port', opts.get('port') || process.env.PORT || 3000);
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

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

var RedisStore = require('socket.io/lib/stores/redis');
io.set('store', new RedisStore({
	redisPub: config.redis || {},
	redisSub: config.redis || {},
	redisClient: config.redis || {}
}));


io.sockets.on('connection', function(socket) {
	socket.on('message', function(data) {
		socket.broadcast.emit('message', { server: 'other client', data: JSON.stringify(data) });
	});
});

