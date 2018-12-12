const router = require('express').Router();
const moment = require('moment');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const Plant = require('../../models/Plant');
const Crop = require('../../models/Crop');
const Photo = require('../../models/Photo');

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

//get all crops in your garden

router.get('/', (req, res) => {
  if (!req.user) {
    return res.send('Please log in to see your garden.');
  } else {
    return Crop.where({ owner_id: req.user.id, crop_status: 1 })
      .fetchAll({ withRelated: ['photo', 'cropStatus', 'plant'] })
      .then(crops => {
        return res.json(crops);
      })
      .catch(err => {
        console.log('error :', err);
      });
  }
});

//get all plant types

router.get('/plants', (req, res) => {
  return Plant.fetchAll().then(plants => {
    res.json(plants);
  });
});

//update watering date thus marking the crop watered

router.put('/water', (req, res) => {
  let promises = req.body.map(id => {
    return Crop.where({ id })
      .fetchAll()
      .then(crop => {
        let waterInt = crop.models[0].attributes.watering_interval;
        let newWaterDate = moment().add(waterInt, 'd');
        return newWaterDate;
      })
      .then(date => {
        return new Crop({ id })
          .save({ watering_date: date }, { patch: true })
          .then(response => response.refresh())
          .then(response => true)
          .catch(() => false);
      });
  });
  Promise.all(promises)
    .then(() => res.json({ success: true }))
    .catch(() => res.json({ success: false }));
});

//edit a crop giving the option to change the photo

router.put('/crop/:id', upload.array('photo', 6), (req, res) => {
  let { id, garden_description, watering_interval, newWaterDate } = req.body;
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
  photoDeletePromise.then(() => {
    return new Crop({ id })
      .save(
        {
          garden_description,
          watering_interval,
          watering_date: newWaterDate
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
                res.json(crop);
              });
          });
        }
      })
      .catch(err => console.log(err));
  });
});

module.exports = router;
