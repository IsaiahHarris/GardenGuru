const router = require('express').Router();
const Crop = require('../../models/Crop');
const User = require('../../models/User');

//get users stands to show in marketplace

router.get('/', (req, res) => {
  if (req.user) {
    return User.where({ city: req.user.city })
      .orderBy('updated_at', 'DESC')
      .fetchAll({ columns: ['stand_name', 'username', 'avatar_link', 'id'] })
      .then(user => {
        return res.json(user);
      })
      .catch(err => {
        console.log('error :', err);
      });
  } else {
    console.log('no user logged in');
  }
});

//get recently added crops that are selling

router.get('/crops', (req, res) => {
  return Crop.query(qb => {
    qb.innerJoin('users', 'crops.owner_id', 'users.id');
    qb.where('users.city', '=', req.user.city).andWhere(
      'crops.selling',
      '=',
      true
    );
  })
    .fetchAll({ withRelated: ['photo'] })
    .then(crops => {
      return res.json(crops);
    });
});
module.exports = router;
