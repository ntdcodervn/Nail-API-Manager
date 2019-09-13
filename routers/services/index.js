const express = require('express');
const router = express.Router();
const auth = require('./../../middleware/auth')
const services = require('../../models/services');

router.get('/getAllServices',auth,async (req,res) => {
    try {
        const service = await services.find();
        res.json({listServices : service});
    } catch (error) {
        res.json({msg:'server error'});
    }
})

module.exports = router;