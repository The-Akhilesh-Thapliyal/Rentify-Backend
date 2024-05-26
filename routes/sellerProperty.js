var express = require('express');
var router = express.Router();
const fileUpload = require('express-fileupload');
const auth = require('../config/auth');
const sellerServices = require('../controllers/sellerServices');

// Middleware
router.use(express.json());
router.use(fileUpload());

router.post('/addProperty',auth.verifyToken , sellerServices.addProperty);

//delete property
router.delete('/deleteProperty/:id',auth.verifyToken, sellerServices.deleteProperty);

//update property
router.put('/updateProperty/:id', auth.verifyToken, sellerServices.updateProperty );

router.get('/getProperties', auth.verifyToken, sellerServices.getProperties);

//dashboard
router.get('/dashboard',auth.verifyToken, sellerServices.dashboard);

//route to fetch properties posted by user and interested user details
router.get('/getInterestedUsers/:id',auth.verifyToken,sellerServices.getInterestedUsers);

//add image to property
router.post('/addImage/:id',auth.verifyToken, async (req, res) => {
  try {
      if (!req.files || !req.files.imgFiles) {
          return res.status(400).json({ message: 'No files uploaded' });
        }
    
        const imgFiles = Array.isArray(req.files.imgFiles) ? req.files.imgFiles : [req.files.imgFiles];
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
        const images = [];
    
        for (const imgFile of imgFiles) {
          const fileExt = path.extname(imgFile.name);
          if (!allowedExtensions.includes(fileExt)) {
            return res.status(400).json({ message: 'Only image files are allowed' });
          }
    
          const filename = `property_img_${Date.now()}${fileExt}`;
          const filepath = `./propertyUploads/${filename}`;
          await imgFile.mv(filepath);
          images.push(filepath);
        }
    res.status(200).json({ message: 'Image added successfully', data: updatedProperty });
  } catch (error) {
    console.error('Error occurred while adding image:', error);
    res.status(500).json({ message: 'Error occurred while adding image', error: error.message });
  }
});



module.exports = router;