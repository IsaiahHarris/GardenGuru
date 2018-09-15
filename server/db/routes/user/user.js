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
        `${req.user.username}/${Date.now().toString()}-${file.originalname}`
      );
    }
  })
});

// ===== ROUTES ===== //

// Gets all messages in inbox
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
        if (response.length < 1) {
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

// Gets all messages pertaining to a particular crop
router.get('/messages/:id', (req, res) => {
  const crop_id = req.params.id;
  if (!req.user) {
    return res.send('Please log in to proceed to your inbox.');
  } else {
    return Message
      .query({
        where: { crop_id, to: req.user.id },
        orWhere: { crop_id, from: req.user.id }
      })
      .fetchAll({ withRelated: ['to', 'from', 'crops'] })
      .then(response => {
        if (response.length < 1) {
          return res.send('Nobody here but us chickens!');
        } else {
          return res.json(response);
        };
      })
      .catch(err => {
        console.log('Error: ', err);
      });
  };
});

// Sends message regarding a specific crop; sellers cannot initiate a conversation
router.post('/:toId/messages/:cropId', (req, res) => {
  const userId = req.user.id;
  const cropId = req.params.cropId;
  const to = Number(req.params.toId); // for proper comparison

  const from = req.body.from;
  const seller_id = req.body.seller_id;
  const messageBody = req.body.content;

  let itemOwner;
  let item;
  let err;

  return Crop
    .where({ id: cropId })
    .fetch()
    .then(crop => { // Crop validation check
      if (!crop) {
        res.send('Item does not exist.')
      }
      itemOwner = crop.attributes.owner_id;
      item = crop.attributes.description.toLowerCase();
    })
    .then(() => { // Three-layer message-and-users validation check
      if (seller_id === from && seller_id !== to) {
        return Message
          .where({
            crop_id: cropId,
            to: seller_id,
            from: to
          })
          .fetch()
          .then(message => {
            if (!message) {
              return err = 'Seller is not allowed to initiate contact.';
            };
          });
      } else if (seller_id === from && seller_id === to) {
        return err = 'You cannot be the recipient of your own message!';
      } else if (userId !== from) {
        return err = 'You cannot send a message as someone else!';
      } else if (seller_id !== to && seller_id !== from) {
        return err = 'This crop does not belong to you nor the recipient!';
      } else if (seller_id !== itemOwner) {
        return err = 'There was an error matching the crop to its owner. Please try again.'
      }
    })
    .then(response => {
      if (response) { // Stops here if "err" is defined
        return res.json({ message: response })
      } else {
        return User
          .where({ id: to })
          .fetch()
          .then(response => {
            // only works with Gmail, need to change domain
            const receiver = response.attributes.email;

            const data = {
              from: `GroBro <${botEmail}>`,
              to: `${receiver}`,
              subject: `Someone is interested in buying your ${item}!`,
              text: `${messageBody}`
            };
            mailgun.messages().send(data, (error, body) => {
              if (error) { console.log(error); }
              console.log('Data :', data);
              console.log('Body :', body);
            });
            return new Message({
              to,
              from,
              seller_id,
              crop_id: cropId,
              content: messageBody
            })
              .save()
              .then(message => {
                res.json(message);
              });
          });
      };
    });
  //         });
  // return Crop
  //   .where({ id: cropId })
  //   .fetch()
  //   .then(crop => { // Crop validation check
  //     if (!crop) {
  //       res.send('Item does not exist.')
  //     }
  //     itemOwner = crop.attributes.owner_id;
  //     item = crop.attributes.description.toLowerCase();
  //   })
  //   .then(() => { // Three-layer message-and-users validation check
  //     if (seller_id === from && seller_id !== to) {
  //       return Message
  //         .where({
  //           crop_id: cropId,
  //           to: seller_id,
  //           from: to
  //         })
  //         .fetch()
  //         .then(message => {
  //           if (!message) {
  //             return err = 'Seller is not allowed to initiate contact.';
  //           };
  //         });
  //     } else if (seller_id === from && seller_id === to) {
  //       return err = 'You cannot be the recipient of your own message!';
  //     } else if (userId !== from) {
  //       return err = 'You cannot send a message as someone else!';
  //     } else if (seller_id !== to && seller_id !== from) {
  //       return err = 'This crop does not belong to you nor the recipient!';
  //     } else if (seller_id !== itemOwner) {
  //       return err = 'There was an error matching the crop to its owner. Please try again.'
  //     }
  //   })
  //   .then(response => {
  //     if (response) { // Stops here if "err" is defined
  //       return res.json({ message: response })
  //     } else {
  //       return User
  //         .where({ id: to })
  //         .fetch()
  //         .then(response => {
  //           // only works with Gmail, need to change domain
  //           const receiver = response.attributes.email;

  //           const data = {
  //             from: `GroBro <${botEmail}>`,
  //             to: `${receiver}`,
  //             subject: `Someone is interested in buying your ${item}!`,
  //             text: `${messageBody}`
  //           };
  //           mailgun.messages().send(data, (error, body) => {
  //             if (error) { console.log(error); }
  //             console.log('Data :', data);
  //             console.log('Body :', body);
  //           });
  //           return new Message({
  //             to,
  //             from,
  //             seller_id,
  //             crop_id: cropId,
  //             content: messageBody
  //           })
  //             .save()
  //             .then(message => {
  //               res.json(message);
  //             });
  //         });
  //     };
  //   });
});

// Gets a user's profile
router.get('/:id', (req, res) => {
  const id = req.params.id;
  return User.where({ id })
    .fetch({ columns: ['username', 'email', 'rating', 'city', 'state', 'stand_name', 'avatar_link', 'first_name', 'last_name', 'bio', 'id'] })
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
  return Crop
    .where({ owner_id: id, selling: true })
    .fetchAll({ withRelated: ['cropStatus', 'plant', 'photo', 'messages'] })
    .then(crops => {
      if (crops.length < 1) {
        return res.json({ message: `This user doesn't have a stand` });
      } else {
        return User
          .where({ id: crops.models[0].attributes.owner_id })
          .fetch({ columns: ['stand_name', 'id', 'avatar_link'] })
          .then(user => {
            crops.models.map(crop => {
              crop.attributes.user = user;
            })
            res.json(crops);
          })
      }
    })
    .catch(err => {
      console.log('error :', err);
    });
});

router.put('/addStand', (req, res) => {
  const { stand_name } = req.body;
  const id = req.user.id;
  return new User({ id })
    .save({ stand_name }, { patch: true })
    .then(user => {
      return user.refresh()
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
      }
      return res.json(userProfile);
    })
    .catch(err => {
      console.log('err.message', err.message);
    });
});

// Change password, location, bio, stand name
router.put('/settings', (req, res) => {
  const username = req.user.username;
  const id = req.user.id;
  const { oldPass, newPass, city, state, bio, stand_name } = req.body;

  return User.where({ username, id })
    .fetchAll()
    .then(user => {
      bcrypt
        .compare(oldPass, user.models[0].attributes.password)
        .then(result => {
          if (!result) {
            res.send('Invalid password.');
          } else {
            bcrypt.genSalt(saltRounds, (err, salt) => {
              bcrypt.hash(newPass, salt, (err, hashedPassword) => {
                if (err) {
                  return res.status(500);
                }
                return User.where({ username, id })
                  .save(
                    {
                      password: hashedPassword,
                      city,
                      state,
                      bio,
                      stand_name
                    },
                    {
                      patch: true
                    }
                  )
                  .then(user => {
                    res.json({ message: 'success' });
                  });
              });
            });
          }
        });
    })
    .catch(err => {
      console.log('error :', err);
    });
});

module.exports = router;
