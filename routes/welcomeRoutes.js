var express = require('express');
var router = express.Router();
var welcomeServices = require('../controllers/welcomeServices');

router.get('/', welcomeServices.welcome );

router.post('/login', welcomeServices.login );

router.post('/register', welcomeServices.register);

router.get('/confirm/:token', welcomeServices.confirmToken);



module.exports = router;