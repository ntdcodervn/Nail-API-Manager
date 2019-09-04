const mongoose = require('mongoose');

const Slot = new mongoose.Schema({
    slotName : {
        type : 'String',
        required : true
    },
    date : {
        type : 'Date',
        required : true
    },
    total : {
        type : 'Number',
        default : 0
    }
});


module.exports = mongoose.model('slot', Slot);