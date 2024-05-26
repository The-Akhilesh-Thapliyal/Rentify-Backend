const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    address: {
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
    },
    geoLocation: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    bedrooms: {
        type: Number,
        required: true,
    },
    bathrooms: {
        type: Number,
        required: true,
    },
    squareFeet: {
        type: Number,
        required: true,
    },
    amenities: {
        type: [String],
        default: [],
    },
    availabilityDate: {
        type: Date,
        required: true,
    },
    images: {
        type: [String], // URLs to images
        default: [],
    },
    owner: {
        type: String,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    likes: [{
        type: String
    }
    ],
    interested: [{
        type: String
    }
    ]

});


module.exports = mongoose.model('House', houseSchema);
