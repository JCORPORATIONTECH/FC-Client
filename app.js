var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/*routes*/
var routes = require('./routes/index'); // all about login
var education = require('./routes/education'); // 교육
var course = require('./routes/course'); // 강의
var session = require('./routes/session'); // 세션
var video = require('./routes/video'); // 비디오
var quiz = require('./routes/quiz'); // 퀴즈/파이널
var evaluate = require('./routes/evaluate'); // 평가
var complete = require('./routes/complete'); // 완료
var profile = require('./routes/profile'); // 정보수정
var api = require('./routes/api');

/*routes*/
var app = express();
var hbs = require('hbs');
var passport = require('passport');
var flash = require('connect-flash');
var cookieSession = require('cookie-session');

//CORS All Accesss allowed
app.use(function (req, res, next) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

 next();
});

app.all('/*', function (req, res, next) {
 // CORS headers
 res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
 res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
 // Set custom headers for CORS
 res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
 if (req.method == 'OPTIONS') {
   res.status(200).end();
 } else {
   res.locals ={
     loggedIn : req.user
   };
   
   next();
 }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname + '/views/modal');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

global.PROJ_TITLE = "OrangeNamu ";
global.AppRoot = process.env.PWD;

app.use(cookieSession({
  	keys: ['FC_Mobile'],
    cookie: {
      maxAge: 1000 * 60 * 60 // 유효기간 1시간
    }  
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', routes);
app.use('/education', education);
app.use('/course', course);
app.use('/session', session);
app.use('/video', video);
app.use('/quiz', quiz);
app.use('/evaluate', evaluate);
app.use('/complete', complete);
app.use('/profile', profile);
app.use('/api/v1', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;