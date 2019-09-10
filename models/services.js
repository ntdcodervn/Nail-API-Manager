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
    },
    time :{
        type : 'Number',
        require : true,
        default : 60
    }

})

module.exports = mongoose.model('services',Service);