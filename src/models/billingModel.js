const mongoose = require('mongoose')

const billingDB = new mongoose.Schema ({
    clientId: {
        type: String,
        required: true
    },
    orderData: {
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'pending'
    },
    orderStartDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    orderEndDate: {
        type: Date,
        required: true
    },
})

module.exports = mongoose.model('billingOrder', billingDB);