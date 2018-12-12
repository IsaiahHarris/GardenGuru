const express = require('express');
const router = express.Router();
const auth = require('./auth/auth');
const crops = require('./crops/crops');
const marketplace = require('./marketplace/marketplace');
const user = require('./user/user');
const garden = require('./garden/garden');

//endpoints for routes

router.use('/', auth);
router.use('/user', user);
router.use('/garden', garden);
router.use('/crops', crops);
router.use('/marketplace', marketplace);

module.exports = router;
