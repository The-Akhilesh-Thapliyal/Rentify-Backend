var User = require('../models/user');
var Property = require('../models/property');
var nodemailer = require('nodemailer');
const credentials = require('../config/credentials');

const getProperties = async (req, res) => {
    try {
        const properties = await Property.find();
        res.status(200).json({ message: 'Properties fetched successfully', data: properties });
    } catch (error) {
        console.error('Error occurred while fetching properties:', error);
        res.status(500).json({ message: 'Error occurred while fetching properties', error: error.message });
    }
}

const likeProperty = async (req, res) => {
    try {
        const property = await Property.findOne({ _id: req.params.id });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        else {
            if (property.likes.includes(req.user)) {
                return res.status(400).json({ message: 'Property already liked' });
            }
            else {
                property.likes.push(req.user);
                await property.save();
                res.status(200).json({ message: 'Property liked successfully', data: property });
            }
        }
    } catch (error) {
        console.error('Error occurred while liking property:', error);
        res.status(500).json({ message: 'Error occurred while liking property', error: error.message });
    }
}

const unlikeProperty = async (req, res) => {
    try {
        const property = await Property.findOne({ _id: req.params.id });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        else {
            if (!property.likes.includes(req.user)) {
                return res.status(400).json({ message: 'Property not liked' });
            }
            else {
                property.likes = property.likes.filter(user => user != req.user);
                await property.save();
                res.status(200).json({ message: 'Property unliked successfully', data: property });
            }
        }
    } catch (error) {
        console.error('Error occurred while unliking property:', error);
        res.status(500).json({ message: 'Error occurred while unliking property', error: error.message });
    }
}

const imInterested = async (req, res) => {
    try {
        const user_email = req.user;
        const property = await Property.findOne({ _id: req.params.id });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        else {
            if (property.interested.includes(req.user)) {
                return res.status(400).json({ message: 'Already interested' });
            }
            else {
                property.interested.push(req.user);
                // Email configuration
                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: credentials.email,
                        pass: credentials.password
                    }
                });
                //send email interested user
                const propertyDetails = `
                <h3>Property Details</h3>
                <p><strong>Title:</strong> ${property.title}</p>
                <p><strong>Description:</strong> ${property.description}</p>
                <p><strong>Address:</strong> ${property.address.street}, ${property.address.city}, ${property.address.state}, ${property.address.postalCode}, ${property.address.country}</p>
                <p><strong>Price:</strong> $${property.price}</p>
                <p><strong>Bedrooms:</strong> ${property.bedrooms}</p>
                <p><strong>Bathrooms:</strong> ${property.bathrooms}</p>
                <p><strong>Square Feet:</strong> ${property.squareFeet} sq ft</p>
                <p><strong>Amenities:</strong> ${property.amenities.join(', ')}</p>
                <p><strong>Availability Date:</strong> ${new Date(property.availabilityDate).toDateString()}</p>
                <p><strong>Interested Users:</strong> ${property.interested.length}</p>
            `;

                var user = await User.findOne({ user_email });
                var owner = await User.findOne({ user_email: property.owner });


                const mailOptions = {
                    from: 'akhileshthapliyal20@gmail.com', // Sender address
                    to: user_email, // Receiver's email
                    subject: `Property Details :  ${property.title}`, // Email subject
                    html: `
                    <html>
                    <head>
                        <style>
                            h1 { color: #007bff; }
                            p { font-size: 16px; }
                            .property-details { font-size: 14px; color: #333; }
                        </style>
                    </head>
                    <body>
                        <h2>Hello ${user.user_name},</h2>
                        <p>Thank you for showing interest in our property!</p>
                        <div class="property-details">
                            ${propertyDetails}
                        </div>
                        <h1 style="color:purple">Owner Details :</h1>
                        <p><strong>Name:</strong> ${owner.user_name}</p>
                        <p><strong>Mobile:</strong> ${owner.user_mobile}</p>
                        <p><strong>Email:</strong> ${owner.user_email}</p>
                    </body>
                    </html>
                `, // Email body
                };

                // Send the email
                transporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        // Handle error in sending email
                        return res.status(500).json({ message: 'Error sending confirmation email', status: 0 });
                    }
                    console.log('Email sent:', info.response);
                    // Email sent successfully
                });

                //send email to owner
                const ownerMailOptions = {
                    from: 'akhileshthapliyal20@gmail.com', // Sender address
                    to: property.owner, // Receiver's email
                    subject: `Interested User: ${user.user_name}`, // Email subject
                    html: `
                    <html>
                    <head>
                        <style>
                            h1 { color: #007bff; }
                            p { font-size: 16px; }
                            .property-details { font-size: 14px; color: #333; }
                        </style>
                    </head>
                    <body>
                        <h2>Hello ${owner.user_name},</h2>
                        <p>The following user is interested in your property:</p>
                        <p><strong>Name:</strong> ${user.user_name}</p>
                        <p><strong>Mobile:</strong> ${user.user_mobile}</p>
                        <p><strong>Email:</strong> ${user.user_email}</p>
                        <div class="property-details">
                            ${propertyDetails}
                        </div>
                    </body>
                    </html>
                `, // Email body
                };

                // Send the email
                transporter.sendMail(ownerMailOptions, async (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        // Handle error in sending email
                        return res.status(500).json({ message: 'Error sending confirmation email', status: 0 });
                    }
                    console.log('Email sent:', info.response);
                    // Email sent successfully
                });



                await property.save();
                res.status(200).json({ message: 'Interested successfully', data: property });
            }
        }
    } catch (error) {
        console.error('Error occurred while showing interest:', error);
        res.status(500).json({ message: 'Error occurred while showing interest', error: error.message });
    }
}

const getInterestedProperties = async (req, res) => {
    try {
        var user = await User.findOne({ user_email: req.user }, { user_password: 0 });
        var properties_interest = await Property.find({ interested: { $in: [user.user_email] } });
        res.status(200).json({ message: 'Properties fetched successfully', data: properties_interest });
    }
    catch (error) {
        console.error('Error occurred while fetching properties:', error);
        res.status(500).json({ message: 'Error occurred while fetching properties', error: error.message });
    }
}

const getLikedProperties = async (req, res) => {
    try {
        var user = await User.findOne({ user_email: req.user }, { user_password: 0 });
        var properties_like = await Property.find({ likes: { $in: [user.user_email] } });
        res.status(200).json({ message: 'Properties fetched successfully', data: properties_like });
    }
    catch (error) {
        console.error('Error occurred while fetching properties:', error);
        res.status(500).json({ message: 'Error occurred while fetching properties', error: error.message });
    }
}


const getOwnerDetails = async (req, res) => {
    try {
        var owner = await User.findOne({ user_email: req.params.id }, { user_password: 0 });
        res.status(200).json({ message: 'Owner details fetched successfully', data: owner });
    }
    catch (error) {
        console.error('Error occurred while fetching owner details:', error);
        res.status(500).json({ message: 'Error occurred while fetching owner details', error: error.message });
    }
}

const dashboard = async (req, res) => {
    try {
        var user = await User.findOne({ user_email: req.user }, { user_password: 0 });
        var properties_interest = await Property.find({ interested: { $in: [user.user_email] } });
        var properties_like = await Property.find({ likes: { $in: [user.user_email] } });
        var count_interest = properties_interest.length;
        var count_like = properties_like.length;
        res.status(200).json({ message: 'Dashboard fetched successfully', data: { user, count_interest, count_like } });
    }
    catch (error) {
        console.error('Error occurred while fetching properties:', error);
        res.status(500).json({ message: 'Error occurred while fetching properties', error: error.message });
    }
}

module.exports = {
    getProperties,
    likeProperty,
    unlikeProperty,
    imInterested,
    getInterestedProperties,
    getOwnerDetails,
    getLikedProperties,
    dashboard
}
