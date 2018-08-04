const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect('mongodb://soyket:handymama123@ds151452.mlab.com:51452/nodekb', { useNewUrlParser: true });
let db = mongoose.connection;

// //check connection
// db.once('open', () => {
//     console.log("Connected to Mongodb.")
// })
//
// //check for db error
// db.on('error', (err) => {
//     console.log(err);
// })


//app init
const app = express();

//bring in modle
const Article = require('./models/article');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

// express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// express validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//passport config
require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req,res,next)=>{
   res.locals.user = req.user || null;
   next();
});


//home route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) console.log(err);
        res.render('index', {
            title: 'Articles',
            articles: articles
        });
    });
});


//route files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

//start server
app.listen(3000, () => console.log("server start on port 3000..."));