const mongoose = require('mongoose');

const Tests = mongoose.Schema({
    users : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users'
    }
});

module.exports = mongoose.model('tests',Tests);