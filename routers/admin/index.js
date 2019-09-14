const express = require('express');
const router = express.Router();
const auth = require('./../../middleware/auth')
const {check,validationResult} = require('express-validator');
const booking = require('../../models/bookings');
const { writeFileSync } = require('fs')
const ics = require('ics')
const nodemailer = require('nodemailer');
const path = require('path');

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
                let transporter = nodemailer.createTransport({
                    service : 'gmail',
                    auth: {
                      user : 'denna247199991@outlook.com',
                      pass : 'denna247'
                    }
                  });
                  console.log(emailTo)
                  let mailOptions ={
                    from : 'denna24719999@gmail.com',
                    to: emailTo,
                    subject: 'Send File Google calendar file',
                    text: 'Google calendar file path .ics',
                    html: 'Link dowload Google calendar <a href="https://nailapimanager.herokuapp.com/uploads/file/event.ics">Dowload file calendar service</a>'
                  }
                  
                  transporter.sendMail(mailOptions, (err, data) => {
                    if(err) {
                      console.log('Error Occurd', err);
                      res.status(202).json({msg:'Sent mail falied !'});
                    }else {
                      console.log('Email sent!!!!');
                    }
                  })
                  res.status(200).json({msg:'Sent mail successfull !'});
            })
           
        }
        
    } catch (error) {
        res.status(501).json({msg:'Server error'});
    }
})

module.exports = router;