const mongoose = require('mongoose');

const Booking = new mongoose.Schema({
    users : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users'
    },
    slot : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'slot' 
    },
    service : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'service'
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