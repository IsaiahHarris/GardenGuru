const router = require('express').Router();
const bcrypt = require('bcrypt');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const saltRounds = 12;
const User = require('../../models/User');
const Crop = require('../../models/Crop');
const Message = require('../../models/Message');

const botEmail = process.env.BOT_EMAIL;
const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.DOMAIN;
const mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

const BUCKET_NAME = process.env.BUCKET_NAME;
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

const s3 = new aws.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET
});

//photo upload to s3

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: 'public-read-write',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      cb(
        null,
        `${req.user.username}/${Date.now().toString()}-${file.originalname}`
      );
    }
  })
});

// ===== ROUTES ===== //

// Gets all messages in inbox
router.get('/', (req, res) => {
  return User.where({ city: req.user.city })
    .orderBy('updated_at', 'DESC')
    .fetchAll({ columns: ['stand_name', 'username', 'avatar_link'] })
    .then(user => {
      return res.json(user);
    })
    .catch(err => {
      console.log('error :', err);
    });
});

//gets a users active conversations

router.get('/conversations', (req, res) => {
  return Message.query(function(qb) {
    qb.where('to', '=', req.user.id).distinct('to', 'from');
  })
    .fetchAll({
      withRelated: [
        {
          to: qb => {
            qb.select('id', 'username');
          },
          from: qb => {
            qb.select('id', 'username');
          }
        }
      ],
      columns: ['content']
    })
    .then(result => {
      return res.json(result);
    });
});

//gets a users sent conversations

router.get('/sentConversations', (req, res) => {
  return Message.query(function(qb) {
    qb.where('from', '=', req.user.id).distinct('to');
  })
    .fetchAll({
      withRelated: [
        {
          to: qb => {
            qb.select('id', 'username');
          }
        }
      ],
      columns: ['content']
    })
    .then(result => {
      return res.json(result);
    });
});

//gets a users messages

router.get('/messages', (req, res) => {
  if (!req.user) {
    return res.send('Please log in to proceed to your inbox.');
  } else {
    return Message.query({
      where: { to: req.user.id },
      orWhere: { from: req.user.id }
    })
      .fetchAll({ withRelated: ['to', 'from'] })
      .then(response => {
        if (!response) {
          return res.send('Nobody here but us chickens!');
        } else {
          return res.json(response);
        }
      })
      .catch(err => {
        console.log('Error: ', err);
      });
  }
});

//gets a conversation

router.post('/messages/:id', (req, res) => {
  const initiatorId = req.user.id;
  const to = Number(req.params.id); // for proper comparison
  const messageBody = req.body.content;
  let err;

  return Message.query(qb => {
    qb.where({ from: initiatorId, to: to });
  })
    .fetch()
    .then(check => {
      if (!check) {
        // If no message of ONLY "user to receiver,"
        // email is sent
        return new Message({
          from: initiatorId,
          to: to,
          content: messageBody
        })
          .save()
          .then(message => {
            return User.where({ id: to })
              .fetch()
              .then(user => {
                const toEmail = user.attributes.email;

                const data = {
                  from: `GroBro <${botEmail}>`,
                  to: `${toEmail}`,
                  subject: `${req.user.username} is trying to reach you!`,
                  text: `${messageBody}`
                };
                mailgun.messages().send(data, (error, body) => {
                  if (error) {
                    console.log(error);
                  }
                });
                res.json(message);
              });
          });
      } else {
        // If message of ONLY "user to receiver"
        // exists, no email is sent
        return new Message({
          from: initiatorId,
          to: to,
          content: messageBody
        })
          .save()
          .then(message => {
            return User.where({ id: to })
              .fetch()
              .then(user => {
                res.json(message);
              });
          });
      }
    });
});

//gets a conversation

router.get('/conversations/:id', (req, res) => {
  const me = req.user.id;
  const they = req.params.id;

  return Message.query({
    where: { from: they, to: me },
    orWhere: { from: me, to: they }
  })
    .fetchAll({ withRelated: ['to', 'from'] })
    .then(result => {
      res.json(result);
    });
});

// Sends message regarding a specific crop; sellers cannot initiate a conversation

// Gets a user's profile
router.get('/:id', (req, res) => {
  const id = req.params.id;
  return User.where({ id })
    .fetch({
      columns: [
        'username',
        'email',
        'rating',
        'city',
        'state',
        'stand_name',
        'avatar_link',
        'first_name',
        'last_name',
        'bio',
        'id'
      ]
    })
    .then(user => {
      if (!user) {
        return res.json({ message: 'User does not exist' });
      } else {
        return res.json(user);
      }
    })
    .catch(err => {
      console.log('error :', err);
    });
});

// Gets a user's stand
router.get('/:id/stand', (req, res) => {
  const id = req.params.id;
  //first check if User has a stand
  return User.where({ id })
    .fetch()
    .then(user => {
      if (!user) {
        return res.json({ message: `This user doesn't have a stand` });
      }
      if (!user.attributes.stand_name) {
        return res.json({ message: `This user doesn't have a stand` });
      }
    })
    .then(response => {
      return Crop.where({ owner_id: id, selling: true })
        .fetchAll({ withRelated: ['cropStatus', 'plant', 'photo'] })
        .then(crops => {
          if (crops.length < 1) {
            return res.json({ message: `No items` });
          } else {
            return User.where({ id: crops.models[0].attributes.owner_id })
              .fetch({ columns: ['stand_name', 'id', 'avatar_link'] })
              .then(user => {
                crops.models.map(crop => {
                  crop.attributes.user = user;
                });
                return res.json(crops);
              });
          }
        });
    })
    .catch(err => {
      console.log('error :', err);
    });
});

// allows the user to create a stand by editing their stand name from null to their desired stand name

router.put('/addStand', (req, res) => {
  const { stand_name } = req.body;
  const id = req.user.id;
  return new User({ id })
    .save({ stand_name }, { patch: true })
    .then(user => {
      return user.refresh();
    })
    .then(user => {
      let userProfile = {
        id: user.attributes.id,
        stand_name: user.attributes.stand_name,
        username: user.attributes.username,
        email: user.attributes.email,
        first_name: user.attributes.first_name,
        last_name: user.attributes.last_name,
        rating: user.attributes.rating,
        bio: user.attributes.bio,
        city: user.attributes.city,
        state: user.attributes.state,
        avatar_link: user.attributes.avatar_link
      };
      return res.json(userProfile);
    })
    .catch(err => {
      console.log('err.message', err.message);
    });
});

// Change password, location, bio, stand name
router.put('/:id', upload.single('photo'), (req, res) => {
  const username = req.user.username;
  const id = req.user.id;
  const { oldPass, newPass, valPass, city, state, bio, stand_name } = req.body;
  let passwordPromise = new Promise((resolve, reject) => {
    if (newPass && newPass !== valPass) {
      reject(res.json({ success: false }));
    } else if (newPass) {
      return User.where({ username, id })
        .fetchAll()
        .then(user => {
          bcrypt
            .compare(oldPass, user.models[0].attributes.password)
            .then(result => {
              if (!result) {
                reject(res.json({ success: false }));
              } else {
                bcrypt.genSalt(saltRounds, (err, salt) => {
                  bcrypt.hash(newPass, salt, (err, hashedPassword) => {
                    if (err) {
                      return res.status(500);
                    }
                    return User.where({ username, id })
                      .save({ password: hashedPassword }, { patch: true })
                      .then(result => {
                        resolve(res.json({ success: true }));
                      });
                  });
                });
              }
            });
        });
    } else {
      resolve();
    }
  });
  let locationPromise = new Promise((resolve, reject) => {
    if (city && state) {
      return User.where({ username, id })
        .fetchAll()
        .then(user => {
          return User.where({ username, id })
            .save({ city, state }, { patch: true })
            .then(result => {
              resolve(res.json({ success: true }));
            })
            .catch(() => {
              reject(res.json({ success: false }));
            });
        });
    } else {
      resolve();
    }
  });
  let standPromise = new Promise((resolve, reject) => {
    if (stand_name) {
      return User.where({ username, id })
        .fetchAll()
        .then(user => {
          if (!user.models[0].attributes.stand_name) {
            reject(res.json({ sucess: false }));
          } else {
            return User.where({ username, id })
              .save({ stand_name }, { patch: true })
              .then(result => {
                resolve(res.json({ success: true }));
              })
              .catch(() => {
                reject(res.json({ success: false }));
              });
          }
        });
    } else {
      resolve();
    }
  });
  let photoPromise = new Promise((resolve, reject) => {
    if (req.file || bio) {
      let avatar_link;
      if (req.file) {
        avatar_link = req.file.location;
      }
      return User.where({ username, id })
        .save({ avatar_link: avatar_link, bio }, { patch: true })
        .then(result => {
          resolve(res.json({ success: true }));
        })
        .catch(() => {
          reject(res.json({ success: false }));
        });
    } else {
      resolve();
    }
  });
  return passwordPromise
    .then(() => {
      return locationPromise;
    })
    .then(() => {
      return standPromise;
    })
    .then(() => {
      return photoPromise;
    })
    .catch(err => console.log(err));
});

module.exports = router;
