/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');         // Basic Auth
var authJwtController = require('./auth_jwt');  // JWT Auth
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        query: "No query params",
        env: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    // req.query will exist; if no query params it will be {}
    if (req.query != null && Object.keys(req.query).length > 0) {
        json.query = req.query;
    }

    return json;
}

// -------------------- /signup (POST only) --------------------
router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            success: false,
            msg: 'Please include both username and password to signup.'
        });
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); // no duplicate checking
        return res.json({ success: true, msg: 'Successful created new user.' });
    }
});

router.all('/signup', (req, res) => {
    res.status(405).send({ message: 'HTTP method not supported.' });
});

// -------------------- /signin (POST only) --------------------
router.post('/signin', (req, res) => {
    var user = db.findOne(req.body.username);

    if (!user) {
        return res.status(401).send({
            success: false,
            msg: 'Authentication failed. User not found.'
        });
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            return res.json({ success: true, token: 'JWT ' + token });
        } else {
            return res.status(401).send({ success: false, msg: 'Authentication failed.' });
        }
    }
});

router.all('/signin', (req, res) => {
    res.status(405).send({ message: 'HTTP method not supported.' });
});

// -------------------- /movies (GET/POST/PUT/DELETE only) --------------------
router.route('/movies')
    .get((req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "GET movies";
        res.json(o);
    })
    .post((req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie saved";
        res.json(o);
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie updated";
        res.json(o);
    })
    .delete(authController.isAuthenticated, (req, res) => {
        var o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie deleted";
        res.json(o);
    })
    .all((req, res) => {
        res.status(405).send({ message: 'HTTP method not supported.' });
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only