const express = require('express');
const router = express.Router();
const auth = require('./../../middleware/auth')
const {check,validationResult} = require('express-validator');
const booking = require('../../models/bookings');
const { writeFileSync } = require('fs')
const ics = require('ics')
const nodemailer = require('nodemailer');
const path = require('path');
const mailjet = require ('node-mailjet')
.connect('b49983dc200e0ed41032b4019f3f3059', '7d324639b1b0eb8fa17dd78c85f5059c')

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
       
            let {idBooking,status} = req.body;
            let updateStatusBooking = await booking.findByIdAndUpdate(idBooking,{status});
            if(updateStatusBooking !== null)
            {
                res.status(200).json({msg : 'Update successfull'});
            }
            else 
            {
                res.status(201).json({msg : 'Update failed'})
            }
           
       
        

        
    } catch (error) {
        res.status(501).json({msg : 'server error'});
    }
});

router.post('/exportCalendar',
[
    check('emailTo','email is not empty').not().isEmpty()
],auth, async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.json({
            errors: errors.array()
        });
    }
    try {
        let {emailTo} = req.body;
        if(req.role === 'admin'){
            const getAllBooking = await booking.find().populate('users').populate('slots');
            
            let listBookInIcsFile = getAllBooking.map((value,key) => {
                const d = new Date(value.slots.date);
                const hour = value.slots.slotName;
                let start = [d.getFullYear(), d.getMonth()+1, d.getDate(), Number(hour.substring(0,hour.indexOf(':'))), 0];
                return {
                    title : 'Booked by ' +value.users.name,
                    description : 'Email : ' + value.users.email,
                    start,
                    duration: { hours : 2  }
                }
            })
            console.log(listBookInIcsFile);
            ics.createEvents(listBookInIcsFile,(error,value) => {
                if(error) {
                    console.log(error);
                    res.status(201).json({msg :'Error when write file ics'});
                }
                console.log(value);
                writeFileSync(path.join(__dirname, './../../uploads/file/event.ics'),value);
                const request = mailjet
.post("send", {'version': 'v3.1'})
.request({
  "Messages":[
    {
      "From": {
        "Email": "ntd.codervn@gmail.com",
        "Name": "Duy"
      },
      "To": [
        {
          "Email": emailTo,
        }
      ],
      "Subject": "Send ics file.",
      "TextPart": "Sending ics file dowload",
      "HTMLPart": "<h3>Link dowload <a href='https://nailapimanager.herokuapp.com/uploads/file/event.ics'>Google calendar file</a></h3>",
      "CustomID": "AppGettingStartedTest"
    }
  ]
})
request
  .then((result) => {
    console.log(result.body);
    res.status(200).json({msg:'Sent mail successfull !'});
  })
  .catch((err) => {
    console.log(err.statusCode);
    res.status(202).json({msg:'Sent mail successfull !'});
  })

                  res.status(200).json({msg:'Sent mail successfull !'});
            })
           
        }
        
    } catch (error) {
        res.status(501).json({msg:'Server error'});
    }
})

module.exports = router;