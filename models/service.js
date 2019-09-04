const mongoose = require('mongoose');

const Service = mongoose.Schema({
    name: {
        type : 'String',
        required : true
    },
    price : {
        type : 'Number',
        required : true
    },
    description : {
        type : 'String'
    },
    image : {
        type : 'Array'
    }

})

module.exports = mongoose.model('service',Service);