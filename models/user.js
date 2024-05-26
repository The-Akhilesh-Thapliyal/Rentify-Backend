const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_img: {type:String},
    user_name: { type: String, required: true },
    user_email: { type: String, required: true, unique: true}, 
    user_password: { type: String, required: true },
    user_role: { type: String, default: "user"},
    user_mobile: { type: String, required: true },
    user_gender: { type: String, required: true },
    user_status: { type: String, default: "deactive" },
    confirmationToken: { type: String },
    resetPasswordToken: { type: String },
    likes: [{ type:String}],
    created_at: { type: Date, default: Date.now }
});

const user_module = mongoose.model('user', userSchema);
module.exports = user_module;