const mongoose = require('mongoose');

const Service = mongoose.Schema({
    idNumber: {
        type : 'String',
        required : true,
        unique : true
    },
    price : {
        type : 'Number',
        required : true
    }

})

module.exports = mongoose.model('services',Service);