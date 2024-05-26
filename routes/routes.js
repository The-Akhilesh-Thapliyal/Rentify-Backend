var express = require('express');
var router = express.Router();
var welcomeRoutes = require('./welcomeRoutes');
var propertyRoutes = require('./sellerProperty');
var clientRoutes = require('./clientRoutes');
var auth = require('../config/auth');
var User = require('../models/user');
var Property = require('../models/property');

router.use('/', welcomeRoutes);
router.use('/property', propertyRoutes);
router.use('/explore', clientRoutes);

router.get('/verify',auth.verifyToken,(req,res)=>{
    res.status(200).json({message:'Token verified',role:req.user_role});
});

module.exports = router;

