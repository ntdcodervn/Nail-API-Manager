const mongoose = require('mongoose');

const Booking = new mongoose.Schema({
    users : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        unique : true,
        required : true
    },
    slots : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'slots',
        required : true
    },
    services : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'services'
    }],
    date : {
        type : 'Date',
        default : Date.now
    },
    status : {
        type : 'Number',
        required : true,
        default : 0
    }
})

module.exports = mongoose.model('bookings',Booking);