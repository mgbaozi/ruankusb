
/**
 * 主程序入口
 */

var express = require('express');
var path = require('path');
var util = require('util');

var config = require('./config');


(function (logError) {

	// 应用初始化

	var app = express();


	// 参数配置

	app.set('port', config.server.port || 3000);
	app.set('cookie secret', config.server.cookieSecret || '');
	app.set('session secret', config.server.sessionSecret || '');
	app.set('static', path.join(__dirname, 'static'));
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.enable('trust proxy');


	// 调试模式错误输出

	if ('development' === app.get('env')) {

		app.use(require('errorhandler')());
	}


	// 路径映射与中间件

	app.use(require('morgan')('dev'));
	app.use(require('body-parser').json());
	app.use(require('method-override')());
	app.use(require('cookie-parser')(app.get('cookie secret')));
	app.use(require('express-session')({ secret: app.get('session secret') }));

	app.get('/', function (req, res) {

		require('./routes/main-page')(req, res, function (err) {

			if (logError && err) logError(err);
		});
	});

	app.post('/', function (req, res) {

		require('./routes/lyrics')(req, res, function (err) {

			if (logError && err) logError(err);
		});
	});

	app.use(require('less-middleware')(app.get('static')));
	app.use(express.static(app.get('static')));
	app.use(require('express-uglify').middleware({ src: app.get('static') }));


	// 启动应用

	app.listen(app.get('port'), function () {

		console.log('DoubanLRC listening on port ' + app.get('port'));
	});


})(function (err) {

	// 错误日志输出

	console.error('\n');
	
	while (err) {

		var message = '错误 ' + err.code + ': ' + err.message + '\n';

		for (var item in err.details) {

			message += item + ': ' + util.inspect(err.details[item], { depth: null }) + '\n';
		}

		(err.fatal ? console.error : console.warn)(message);

		err = err.prevErr;
	}
});