/**
 * Satellizer Node.js Example
 * (c) 2015 Sahat Yalkabov
 * License: MIT
 */

var path = require('path');
var qs = require('querystring');

var async = require('async');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var colors = require('colors');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');
var Promise = require('bluebird');
var _ = require('lodash');

var config = require('./config');

mongoose.Promise = Promise;

var userSchema = new mongoose.Schema({
  displayName: String,
  picture: String,
  instagram: String,
  access_token: String,
  images: Array
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

var User = mongoose.model('User', userSchema);

mongoose.connect(config.MONGO_URI);
mongoose.connection.on('error', function(err) {
  console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

var app = express();

app.set('port', process.env.NODE_PORT || 3000);
app.set('host', process.env.NODE_IP || 'localhost');
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}
app.use(express.static(path.join(__dirname, '/public')));

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(401).send({
      message: 'Please make sure your request has an Authorization header'
    });
  }
  var token = req.header('Authorization').split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (err) {
      res.status(400).send({ message: err });
    }

    delete user.access_token;
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.images = req.body.images || user.images;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});

app.get('/api/images', ensureAuthenticated, function(req, res) {
  var token = req.header('Authorization').split(' ')[1];
  var payload = jwt.decode(token, config.TOKEN_SECRET);

  User.findById(payload.sub, function(err, user) {
    if (err) {
      res.status(400).send({ message: 'User not found' });
    }

    var url = 'https://api.instagram.com/v1/users/self/media/recent/' +
      '?access_token=' + user.access_token;

    request({url}, function(error, image_res, image_body) {
      var images = _.filter(JSON.parse(image_body).data, {type: 'image'});
      var parsed_images = _.map(images, function(image) {
        return {
          url: image.images.standard_resolution.url,
          id: image.id
        };
      });

      res.send(_.map(parsed_images, 'url'));
    });
  });
});

/*
|--------------------------------------------------------------------------
| Login with Instagram
|--------------------------------------------------------------------------
*/
app.post('/auth/instagram', function(req, res) {
  var accessTokenUrl = 'https://api.instagram.com/oauth/access_token';

  var params = {
    client_id: req.body.clientId,
    redirect_uri: req.body.redirectUri,
    client_secret: config.INSTAGRAM_SECRET,
    code: req.body.code,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post({ url: accessTokenUrl, form: params, json: true }, function(error, response, body) {
    // Step 2a. Link user accounts.
    if (req.header('Authorization')) {
      User.findOne({ instagram: body.user.id }, function(err, existingUser) {
        if (existingUser) {
          return res.status(409).send({
            message: 'There is already an Instagram account that belongs to you'
          });
        }

        var token = req.header('Authorization').split(' ')[1];
        var payload = jwt.decode(token, config.TOKEN_SECRET);

        User.findById(payload.sub, function(err, user) {
          if (!user) {
            return res.status(400).send({ message: 'User not found' });
          }
          user.instagram = body.user.id;
          user.picture = user.picture || body.user.profile_picture;
          user.displayName = user.displayName || body.user.username;
          user.access_token = body.access_token;
          user.save(function() {
            delete user.access_token;
            var token = createJWT(user);
            res.send({ token: token });
          });
        });
      });
    } else {
      // Step 2b. Create a new user account or return an existing one.
      User.findOne({ instagram: body.user.id }, function(err, existingUser) {
        if (err) {
          console.error(JSON.stringify(err, null, 2));
          return res.status(400).send({message: 'Error creating user'});
        }

        if (existingUser) {
          return res.send({ token: createJWT(existingUser) });
        }

        var user = new User({
          instagram: body.user.id,
          picture: body.user.profile_picture,
          displayName: body.user.username,
          access_token: body.access_token,
          images: []
        });

        user.save(function(err) {
          if (err) {
            console.error(JSON.stringify(err, null, 2));
            return res.status(400).send({message: 'Error saving user\n' + err.errmsg});
          }

          delete user.access_token;
          var token = createJWT(user);
          res.send({ token: token, user: user });
        });
      });
    }
  });
});

/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
app.post('/auth/unlink', ensureAuthenticated, function(req, res) {
  var provider = req.body.provider;
  var providers = ['instagram'];

  if (providers.indexOf(provider) === -1) {
    return res.status(400).send({ message: 'Unknown OAuth Provider' });
  }

  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User Not Found' });
    }
    user[provider] = undefined;
    user.save(function() {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
app.listen(app.get('port'), app.get('host'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
