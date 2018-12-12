const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const router = express.Router();
const app = express();

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const BUCKET_NAME = process.env.BUCKET_NAME;
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

const User = require('../../models/User');
const saltRounds = 12;

const s3 = new aws.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: 'public-read-write',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(
        null,
        `${req.body.username}/avatar/${Date.now().toString()}-${file.originalname}`
      );
    }
  })
});

// ===== PASSPORT METHODS ===== //

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  return done(null, {
    id: user.id,
    username: user.username.toLowerCase(),
  });
});

passport.deserializeUser((user, done) => {
  new User({ id: user.id })
    .fetch()
    .then(user => {
      user = user.toJSON();
      return done(null, {
        id: user.id,
        username: user.username.toLowerCase(),
        city: user.city,
        state: user.state
      });
    })
    .catch(err => {
      console.log('error : ', err);
      return done(err);
    });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    return new User({ username: username })
      .fetch()
      .then(user => {
        if (user === null) {
          return done(null, false, {
            message: 'Invalid Username and/or Password'
          });
        } else {
          user = user.toJSON();
          bcrypt.compare(password, user.password).then(samePassword => {
            if (samePassword) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: 'Invalid Username and/or Password'
              });
            }
          });
        }
      })
      .catch(err => {
        console.log('error: ', err);
        return done(err);
      });
  })
);

// ===== REGISTRATION ===== //
router.post('/register', upload.single('photo'), (req, res) => {
  let { username, email, first_name, last_name, city, state } = req.body;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      return res.status(500);
    }
    bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
      if (err) {
        return res.status(500);
      }
      let avatar_link;
      if (req.file) {
        avatar_link = req.file.location
      } else {
        avatar_link = null
      }
      return new User({
        username: username.toLowerCase(),
        password: hashedPassword,
        email,
        first_name,
        last_name,
        city,
        state,
        avatar_link,
      })
        .save()
        .then(result => {
          res.json({ success: true });
        })
        .catch(err => {
          console.log('error : ', err);
          return res.send('Unable to register with that username');
        });
    });
  });
});

// ===== LOG IN / LOG OUT ===== //

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.login(user, err => {
      if (err) {
        return next(err);
      } else {
        let userProfile = {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          rating: user.rating,
          bio: user.bio,
          city: user.city,
          state: user.state,
          stand_name: user.stand_name
        };
        return res.json(userProfile);
      }
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  res.json({ success: true });
});

module.exports = router;
