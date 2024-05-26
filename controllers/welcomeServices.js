const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const credentials = require('../config/credentials');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


const welcome = (req, res) => {
    res.status(200).json({ message: 'Welcome to the API' });
}

const login = async (req, res) => {
    try {
        const { user_email, user_password } = req.body;

        const user = await User.findOne({ user_email });
        // console.log(user);

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed', status: 0 });
        }


        const passwordMatch = bcrypt.compareSync(user_password, user.user_password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Authentication failed incorrect credentials', status: 0 });
        }

        if (user.user_status === 'disabled') {
            // if user is disabled by admin
            return res.status(401).json({ message: 'Authentication failed contact Administrator', status: 2 });
        }
        if (user.user_status === 'deactive') {
            return res.status(401).json({ message: 'Verify your Email Through Confirmation Link', status: 3 });
        }

        const token = jwt.sign({ user_email: user_email, role: user.user_role }, 'Hello', { expiresIn: '8h' });

        res.status(200).json({ token, ...user._doc });
    } catch (error) {
        console.error("Error in user login: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const register = async (req, res) => {
    try {
        const { user_name, user_email, user_password, user_mobile, user_gender, user_role } = req.body;
        // console.log(req.body);
        if (user_role == "admin") {
            return res.status(401).json({ message: 'User Registration Failed !', status: 0 });
        }
        const hashedPassword = bcrypt.hashSync(user_password, 10);
        // Generate random bytes
        const randomBytes = crypto.randomBytes(2);
        const hexString = randomBytes.toString('hex');
        const token = parseInt(hexString, 16) % 900000 + 100000; // Ensures a six-digit number
        const confirmationLink = `http://localhost:8000/api/confirm/${token}`;

        // Email configuration
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: credentials.email,
                pass: credentials.password
            }
        });

        // Check if the email already exists
        const existingUser = await User.findOne({ user_email });
        if (existingUser && existingUser.user_status == "active") {
            return res.status(400).json({ message: 'Email already registered', status: 0 });
        }
        else if (existingUser && existingUser.user_status == "deactive") {
            existingUser.user_name = user_name;
            existingUser.user_password = hashedPassword;
            existingUser.user_mobile = user_mobile;
            existingUser.user_gender = user_gender;
            existingUser.user_role = user_role;

            // Save the user to the database
            existingUser.confirmationToken = token;

            // Email content with confirmation link
            const mailOptions = {
                from: 'akhileshthapliyal20@gmail.com', // Sender address
                to: user_email, // Receiver's email
                subject: 'Registration Confirmation', // Email subject
                html: `<html>
                <head>
                    <style>
                        h1 { color: #007bff; }
                        p { font-size: 16px; }
                        .otp { font-size: 24px; color: #dc3545; }
                    </style>
                </head>
                <body>
                    <h2>Hello ${user_name},</h2>
                    <p>Thank you for registering with us!</p>
                    <div>
                        <h3>Click on the link to confirm your email address:</h3>
                        <a href="${confirmationLink}">${confirmationLink}</a>
                    </div>
                </body>
            </html>`, // Email body
            };

            // Send the email
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    // Handle error in sending email
                    return res.status(500).json({ message: 'Error sending confirmation email', status: 0 });
                }
                console.log('Email sent:', info.response);
                await existingUser.save();
                // Email sent successfully
                res.status(200).json({ message: 'User registered successfully. ReConfirmation email sent.', status: 1, user: existingUser });
            });

        }
        else {
            // Create a new user
            const newUser = new User({
                user_name,
                user_email,
                user_password: hashedPassword,
                user_mobile,
                user_gender,
                user_role
            });

            // Save the user to the database
            newUser.confirmationToken = token;



            // Email content with confirmation link
            const mailOptions = {
                from: 'akhileshthapliyal20@gmail.com', // Sender address
                to: user_email, // Receiver's email
                subject: 'Registration Confirmation', // Email subject
                html: `<html>
                <head>
                    <style>
                        h1 { color: #007bff; }
                        p { font-size: 16px; }
                        .otp { font-size: 24px; color: #dc3545; }
                    </style>
                </head>
                <body>
                    <h2>Hello ${user_name},</h2>
                    <p>Thank you for registering with us!</p>
                    <div>
                    <h3>Click on the link to confirm your email address:</h3>
                    <a href="${confirmationLink}">${confirmationLink}</a>
                    </div>
                </body>
            </html>`, // Email body with HTML formatting
            };


            // Send the email
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    // Handle error in sending email
                    return res.status(500).json({ message: 'Error sending confirmation email', status: 0 });
                }
                console.log('Email sent:', info.response);
                await newUser.save();
                // Email sent successfully
                res.status(200).json({ message: 'User registered successfully. Confirmation email sent.', status: 1, user: newUser });
            });

            // Hash the password
        }


    } catch (error) {
        console.error("Error in user registration: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const confirmToken = async (req, res) => {
    try {
        const token = req.params.token;

        // Find the user by the confirmation token
        const user = await User.findOne({ confirmationToken: token });

        if (!user) {
            // Handle invalid or expired token
            // return res.status(400).json({ message: 'Invalid or expired confirmation link - goto https://rentify.jayworks.tech', status: 0 });
            return res.status(400).json({ message: 'Invalid or expired confirmation link - goto http://localhost:3000', status: 0 });
        }

        // Update the user's status to confirmed (or perform any necessary actions)
        user.user_status = 'active';
        user.confirmationToken = null;
        await user.save();

        // Redirect the user to a success page or send a confirmation message
        // res.redirect('https://rentify.jayworks.tech/login');
        res.redirect('http://localhost:3000/');

        // res.status(200).json({ message: 'User registration confirmed successfully', status: 1 });

    } catch (error) {
        console.error("Error confirming user registration: ", error);
        res.status(500).json({ message: 'Internal Server Error', status: 0 });
    }
}

module.exports = {
    login,
    register,
    confirmToken,
    welcome
};