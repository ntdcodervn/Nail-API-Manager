const express = require('express');
const router = express.Router();
const auth = require('./../../middleware/auth')
const {check,validationResult} = require('express-validator');
const booking = require('../../models/bookings');

router.post('/changeStatusBooking',auth,[
    check('idBooking','Id booking is not empty').not().isEmpty(),
    check('status','Status booking is not empty').not().isEmpty(),
    check('status','Status booking have to number').isNumeric()
],async (req,res) => {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
       
        return res.json({ errors: errors.array() });
      }
    try {
        if(req.role === 'admin')
        {
            let {idBooking,status} = req.body;
            let updateStatusBooking = await booking.findByIdAndUpdate(idBooking,{status});
            if(updateStatusBooking !== null)
            {
                res.json({msg : 'Update successfull'});
            }
            else 
            {
                res.json({msg : 'Update failed'})
            }
           
        }
        else {
            res.json({msg : 'You do not have access to this API'});
        }
        

        
    } catch (error) {
        res.status(501).json({msg : 'server error'});
    }
})

module.exports = router;