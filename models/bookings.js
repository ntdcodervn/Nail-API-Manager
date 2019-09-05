const mongoose = require('mongoose');

const Booking = new mongoose.Schema({
    users : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users'
    },
    slot : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'slots' 
    },
    service : [{
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