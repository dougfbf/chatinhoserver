const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    user: {
        required: true,
        type: String
    },
    text: {
        required: true,
        type: String
    },
    type: {
        required: true,
        type: String
    },
    date: {
        required: true,
        type: String
    }
})

module.exports = mongoose.model('Data', dataSchema)