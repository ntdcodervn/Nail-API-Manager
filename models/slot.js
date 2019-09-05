const mongoose = require('mongoose');

const Slot = new mongoose.Schema({
    slotName : {
        type : 'String'
    },
    date : {
        type : 'Date'
       
    },
    total : {
        type : 'Number',
        default : 0
    }
});


module.exports = mongoose.model('slots', Slot);