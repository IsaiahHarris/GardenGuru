const router = require('express').Router();
const moment = require('moment');

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const Crop = require('../../models/Crop');
const CropStatus = require('../../models/CropStatus');
const Plant = require('../../models/Plant');
const Photo = require('../../models/Photo');
const Message = require('../../models/Message');
const User = require('../../models/User');

const BUCKET_NAME = process.env.BUCKET_NAME;
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

const s3 = new aws.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET
});

//photo upload to s3 function

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

// get all crops for marketplace

router.get('/', (req, res) => {
  return Crop.query(function(qb) {
    qb.where('selling', '=', true);
    qb.orderBy('created_at', 'DESC');
  })
    .fetchAll({ withRelated: ['plant', 'photo'] })
    .then(result => {
      res.json(result);
    });
});

// post a crop to garden
router.post('/', upload.array('photo', 6), (req, res) => {
  let error;
  let id = req.user.id;
  let { plant, watering, month, day, year, garden_description } = req.body;
  //YYYY-MM-DD
  //sets the next watering_date
  let date = moment()
    .year(year)
    .month(month)
    .date(day);
  let watering_date = moment(date).add(watering, 'd');
  let convertedWateringDate = moment(watering_date)
    .local()
    .format('YYYY-MM-DD HH:mm:ss');
  //getting harvest date to be saved in the crop
  if (
    !req.body.plant ||
    !req.body.watering ||
    !req.body.month ||
    !req.body.day ||
    !req.body.year ||
    !req.body.garden_description
  ) {
    return res.send('An error occurred while trying to post a new crop.');
  } else {
    return Plant.where({ id: plant })
      .fetchAll()
      .then(plant => {
        let harvestDays = plant.models[0].attributes.days_to_harvest;
        let harvest_date = moment(date).add(harvestDays, 'd');
        return harvest_date;
      })
      .then(harvest_date => {
        return new Crop({
          plant_id: plant,
          watering_interval: watering,
          watering_date: convertedWateringDate,
          planted_on: date,
          garden_description,
          description: '',
          crop_status: 1,
          owner_id: id,
          garden_description,
          harvest_date
        })
          .save()
          .then(newCrop => {
            if (req.files.length === 0) {
              return res.json(newCrop);
            }
            let promises = req.files.map(file => {
              return new Photo({
                crop_id: newCrop.id,
                link: file.location
              }).save();
            });
            Promise.all(promises).then(() => res.json(newCrop));
          });
      })
      .catch(err => console.log(err));
  }
});

//post a crop directly to stand
router.post('/stand', upload.array('photo', 6), (req, res) => {
  let id = req.user.id;
  let { description, details, inventory, price, plant } = req.body;
  let date = new Date();
  return new Crop({
    plant_id: plant,
    garden_description: '',
    description,
    details,
    inventory,
    price,
    owner_id: id,
    watering_interval: 0,
    planted_on: date,
    selling: true,
    crop_status: 2
  })
    .save()
    .then(newCrop => {
      if (req.files.length === 0) {
        return res.json(newCrop);
      }
      let promises = req.files.map(file => {
        return new Photo({
          crop_id: newCrop.id,
          link: file.location
        }).save();
      });
      Promise.all(promises).then(() => res.json(newCrop));
    })
    .catch(err => console.log(err));
});

//search query in marketplace stand or garden unauth and auth

router.post('/search/:term', (req, res) => {
  const search = req.params.term;
  const category = req.body.category;
  let err;

  if (!req.user) {
    if (category === 'My Garden' || category === 'My Stand') {
      res.send(
        'You can only search through the marketplace. Please log in to search through your own crops!'
      );
    } else if (category === 'Marketplace') {
      return Crop.query(qb => {
        qb.where('selling', '=', true).andWhere(
          'description',
          'ILIKE',
          `%${search}%`
        );
      })
        .fetchAll({
          withRelated: [
            {
              owner: qb => {
                qb.column('id', 'stand_name');
              }
            },
            'photo'
          ]
        })
        .then(response => {
          if (err) {
            return res.send(err);
          } else {
            if (response.length < 1) {
              return res.send(
                'Nobody here but us chickens! Try entering in something else, or logging in for a more focused search around your area.'
              );
            } else {
              return res.json(response);
            }
          }
        })
        .catch(err => {
          console.log('Error :', err);
        });
    }
  } else {
    if (category === 'Marketplace') {
      return Crop.query(qb => {
        qb.where('description', 'ILIKE', `%${search}%`)
          .andWhere('selling', '=', true)
          .andWhere('owner_id', '!=', req.user.id);
      })
        .fetchAll({
          withRelated: [
            {
              owner: qb => {
                qb.column('id', 'stand_name');
              }
            },
            'photo'
          ]
        })
        .then(response => {
          if (response.length < 1) {
            return res.send('Nobody here but us chickens!');
          } else {
            return res.json(response);
          }
        })
        .catch(err => {
          console.log('Error :', err);
        });
    } else if (category === 'My Stand') {
      return Crop.query(qb => {
        qb.where('description', 'ILIKE', `%${search}%`)
          .andWhere('owner_id', '=', req.user.id)
          .andWhere('selling', '=', true);
      })
        .fetchAll({ withRelated: ['photo'] })
        .then(response => {
          if (response.length < 1) {
            return res.send('Nobody here but us chickens!');
          } else {
            return res.json(response);
          }
        })
        .catch(err => {
          console.log('Error :', err);
        });
    } else if (category === 'My Garden') {
      return Crop.query(qb => {
        qb.where('garden_description', 'ILIKE', `%${search}%`)
          .andWhere('crop_status', '=', 1)
          .andWhere('owner_id', '=', req.user.id);
      })
        .fetchAll({ withRelated: ['photo'] })
        .then(response => {
          if (response.length < 1) {
            return res.send('Nobody here but us chickens!');
          } else {
            return res.json(response);
          }
        })
        .catch(err => {
          console.log('Error :', err);
        });
    }
  }
});

//get a single crop

router.get('/:id', (req, res) => {
  const id = req.params.id;
  return Crop.query({ where: { id } })
    .fetch({ withRelated: ['plant', 'photo'] })
    .then(crop => {
      return User.query({ where: { id: crop.attributes.owner_id } })
        .fetch({ columns: ['id', 'username', 'stand_name'] })
        .then(user => {
          crop.attributes['user'] = user.attributes;
          return res.json(crop);
        });
    })
    .catch(err => {
      console.log('err', err);
    });
});

//delete a single crop

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  return Crop.where({ id })
    .fetch()
    .then(crop => {
      let status = crop.attributes.crop_status;
      status = 2;
      return Crop.where({ id })
        .save({ crop_status: status, selling: false }, { patch: true })
        .then(() => {
          res.json({ success: 'true' });
        })
        .catch(err => {
          console.log('err.message', err.message);
        });
    });
});

//edit a single crop

router.put('/:id', upload.array('photo', 6), (req, res) => {
  let { id, description, details, inventory, price } = req.body;
  let photoDeletePromise = new Promise((resolve, reject) => {
    if (req.body.delete) {
      if (Array.isArray(req.body.delete)) {
        let deleteArr = Object.values(req.body.delete);
        let deletePromises = deleteArr.map(link => {
          return Photo.where({ link, crop_id: id }).destroy();
        });
        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(() => reject());
      } else {
        return Photo.where({ link: req.body.delete, crop_id: id })
          .destroy()
          .then(() => resolve())
          .catch(() => reject());
      }
    } else {
      resolve();
    }
  });

  //take photo off crop

  photoDeletePromise
    .then(() => {
      return new Crop({ id })
        .save(
          {
            description,
            details,
            inventory,
            price
          },
          { patch: true }
        )
        .then(result => {
          if (req.files.length === 0 || !req.files) {
            result.refresh({ withRelated: ['plant', 'photo'] }).then(crop => {
              return res.json(crop);
            });
          } else {
            let promises = req.files.map(file => {
              return new Photo({
                crop_id: id,
                link: file.location
              }).save();
            });
            Promise.all(promises).then(() => {
              return Crop.where({ id })
                .fetchAll({ withRelated: ['plant', 'photo'] })
                .then(crop => {
                  return User.query({
                    where: { id: crop.models[0].attributes.owner_id }
                  })
                    .fetch({ columns: ['id', 'username', 'stand_name'] })
                    .then(user => {
                      crop.models[0].attributes['user'] = user.attributes;
                      return res.json(crop);
                    });
                });
            });
          }
        });
    })
    .catch(err => console.log(err));
});

//move crop to stand by changing selling =  true

router.put('/:id/move', upload.array('photo', 6), (req, res) => {
  const id = req.params.id;
  const { description, details, price, inventory, check } = req.body;
  const selling = true;
  let savingPhotosPromise = new Promise((resolve, reject) => {
    if (req.body.links) {
      if (Array.isArray(req.body.links)) {
        let linkArr = Object.values(req.body.links);
        let linkPromises = linkArr.map(link => {
          return Photo.where({ link, crop_id: id }).save(
            { selling },
            { patch: true }
          );
        });
        Promise.all(linkPromises)
          .then(() => resolve())
          .catch(() => reject());
      } else {
        return Photo.where({ link: req.body.link, crop_id: id })
          .save({ selling })
          .then(() => resolve())
          .catch(() => reject());
      }
    } else {
      resolve();
    }
  });
  let savePhotoLocationPromise = new Promise((resolve, reject) => {
    if (req.files.length === 0 || !req.files) {
      resolve();
    } else {
      let promises = req.files.map(file => {
        return new Photo({
          crop_id: id,
          link: file.location,
          selling
        }).save();
      });
      Promise.all(promises)
        .then(() => resolve())
        .catch(() => reject());
    }
  });
  savingPhotosPromise
    .then(() => {
      savePhotoLocationPromise;
    })
    .then(() => {
      if (check == 'true') {
        return new Crop({ id })
          .save(
            {
              description,
              details,
              price,
              inventory,
              selling
            },
            { patch: true }
          )
          .then(crop => {
            return res.json(crop);
          })
          .catch(err => {
            console.log('err.message', err.message);
          });
      } else if (check == 'false') {
        return new Crop({ id })
          .save(
            { description, details, price, inventory, selling, crop_status: 2 },
            { patch: true }
          )
          .then(crop => {
            return res.json(crop);
          })
          .catch(err => {
            console.log('err.message', err.message);
          });
      }
    });
});

module.exports = router;
