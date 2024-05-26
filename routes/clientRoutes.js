var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
const clientServices = require('../controllers/clientServices');


router.get('/getProperties',auth.verifyToken, clientServices.getProperties );;

router.post('/likeProperty/:id', auth.verifyToken, clientServices.likeProperty);

router.post('/unlikeProperty/:id', auth.verifyToken, clientServices.unlikeProperty);

router.post('/imInterested/:id', auth.verifyToken, clientServices.imInterested);

router.get('/getInterestedProperties', auth.verifyToken, clientServices.getInterestedProperties);

router.get('/getOwnerDetails/:id', auth.verifyToken, clientServices.getOwnerDetails);

router.get('/dashboard',auth.verifyToken, clientServices.dashboard);

router.get('/getLikedProperties',auth.verifyToken, clientServices.getLikedProperties);



module.exports = router;