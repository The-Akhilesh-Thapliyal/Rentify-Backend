const Property = require('../models/property');
const User = require('../models/user');


const addProperty = async (req, res) => {
  if (req.user_role != 'seller') {
    return res.status(401).json({ message: 'Unauthorized Access' });
  }
  try {
    console.log(req.body);
    const {
      title,
      description,
      address,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
      amenities,
      geoLocation,
      availabilityDate,
    } = req.body;

    const newProperty = new Property({
      title,
      description,
      address,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
      amenities,
      availabilityDate,
      geoLocation,
      owner: req.user
    });

    const savedProperty = await newProperty.save();
    res.status(200).json({ message: 'Property added successfully', data: savedProperty });
  } catch (error) {
    console.error('Error occurred while adding property:', error);
    res.status(500).json({ message: 'Error occurred while adding property', error: error.message });
  }
}

const updateProperty = async (req, res) => {
  try {
    if (req.user_role != 'seller') {
      return res.status(401).json({ message: 'Unauthorized Access' });
    }
    const property = await Property.findOne({ _id: req.params.id, owner: req.user });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    else {
      const {
        title,
        description,
        address,
        price,
        bedrooms,
        bathrooms,
        squareFeet,
        amenities,
        geoLocation,
        availabilityDate,
      } = req.body;
      property.title = title;
      property.description = description;
      property.address = address;
      property.price = price;
      property.bedrooms = bedrooms;
      property.bathrooms = bathrooms;
      property.squareFeet = squareFeet;
      property.amenities = amenities;
      property.availabilityDate = availabilityDate;
      property.geoLocation = geoLocation;
      property.updatedAt = Date.now();
      await property.save();
    }
    res.status(200).json({ message: 'Property updated successfully', data: property });
  } catch (error) {
    console.error('Error occurred while updating property:', error);
    res.status(500).json({ message: 'Error occurred while updating property', error: error.message });
  }
}

const deleteProperty = async (req, res) => {
  try {
    if (req.user_role != 'seller') {
      return res.status(401).json({ message: 'Unauthorized Access' });
    }

    const property = await Property.findOneAndDelete({ _id: req.params.id, owner: req.user });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error occurred while deleting property:', error);
    res.status(500).json({ message: 'Error occurred while deleting property', error: error.message });
  }
}

const dashboard = async (req,res)=>{
  if(req.user_role == 'seller'){
    try{
        var user = await User.findOne({user_email:req.user},{user_password:0});
        var properties_posted = await Property.find({owner:req.user});
        var count_properties = properties_posted.length;
        var count_interest = 0;
        properties_posted.forEach(property => {
          count_interest += property.interested.length;
        });
        res.status(200).json({message:'Dashboard fetched successfully',data:{user,count_properties,count_interest}});
    }
    catch(error){
        console.error('Error occurred while fetching properties:', error);
        res.status(500).json({ message: 'Error occurred while fetching properties', error: error.message });
    }
  }
  else{
    res.status(401).json({message:'Unauthorized Access'});
  }
}

const getProperties = async (req, res) => {
  if (req.user_role == 'seller') {
  try {
    const properties = await Property.find({ owner: req.user});
    res.status(200).json({ message: 'Properties fetched successfully', data: properties });
  } catch (error) {
    console.error('Error occurred while fetching properties:', error);
    res.status(500).json({ message: 'Error occurred while fetching properties', error: error.message });
  }
  }
  else {
    res.status(401).json({ message: 'Unauthorized Access' });
  }
}

const getInterestedUsers = async (req,res)=>{
  if(req.user_role == 'seller'){
    try{
        var property = await  Property.findOne({_id:req.params.id,owner:req.user});
        if(!property){
          return res.status(404).json({message:'Property not found'});
        }
        var interested_users = [];
        for(const user_email of property.interested){
          var user = await User.findOne({user_email},{user_password:0,role:0,createdAt:0,confirmationToken:0, user_status:0,resetPasswordToken:0});
          interested_users.push(user);
        }
        res.status(200).json({message:'Interested Users fetched successfully',data:interested_users});
    }
    catch(error){
        console.error('Error occurred while fetching interested users:', error);
        res.status(500).json({ message: 'Error occurred while fetching interested users', error: error.message });
    }
  }
  else{
    res.status(401).json({message:'Unauthorized Access'});
  }
}


module.exports = {
  addProperty,
  updateProperty,
  deleteProperty,
  dashboard,
  getProperties,
  getInterestedUsers
}
