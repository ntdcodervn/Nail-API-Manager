const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const USER = require('./../../models/users');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('./../../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination : function(req,file,cb)
    {
     cb(null, './uploads/');

    },
    filename: function(req,file,cb)
    {
      cb(null, new Date().toISOString() + file.originalname);
    }
})

const upload = multer({storage : storage});


/*
    @api/users/signUp
    Params : {
      email,
      password,
      firstName,
      lastName
    }
*/
router.post('/signUp', 
[
    check('email', 'Email not empty').not().isEmpty(),
    check('password', 'Password not empty').not().isEmpty(),
    check('firstName', 'Firstname not empty').not().isEmpty(),
    check('lastName', 'Lastname not empty').not().isEmpty(),
    check('email', 'Email invalidate').isEmail(),
    check('password', 'Password length must be over 6 characters').isLength({min : 6})
] , 
async (req,res) => {


   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {email, password , firstName, lastName } = req.body;

    var name = firstName + " " + lastName;
   
    try {
      let userCheckExist = await USER.findOne({email : email});

      
      if(userCheckExist != null)
      {
        return res.json({msg : 'Email already exists'});
      }
     
     
      var salt = await bcrypt.genSaltSync(10);
      var hashPass = await bcrypt.hashSync(password, salt);
  
      var userInsert = new USER({
          email,
          password : hashPass,
          name,
          avatar : 'uploads/avatar-default.jpg',
          point : 0
      });
      
      await userInsert.save();
      
     


    } catch (error) {
      res.json({ msg : 'Server error' });
    }
    res.json({msg : 'Sign Up Success'});
  
})

/*
    @api/users/signIn
    Params : {
      email,
      password
    }
*/

router.post('/signIn',[
    check('email', 'Email not empty').not().isEmpty(),
    check('password', 'Password not empty').not().isEmpty(),
    check('email', 'Email invalidate').isEmail(),
    check('password', 'Password length must be over 6 characters').isLength({min : 6})
] , async (req,res) => {
  console.log(req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
       
        return res.json({ errors: errors.array()});
      }

      const {email,password} = req.body;

      
      try {
        let userCheck = await USER.findOne({email});
        console.log(userCheck);
        if(userCheck === null)
        {
          return res.json({ errors: [{msg : 'Wrong email or password'}] });
        }
        if(!bcrypt.compareSync(password, userCheck.password))
          {
            return res.json({ errors: [{msg : 'Wrong email or password'}] });
            
          }
     

      const payload = {
        id : userCheck.id,
        role : userCheck.role
      }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        (err,token) => {
          if(err) throw err;
          res.json({token});
        }
        )
      
      } catch (error) {
        res.status(422).json({ errors: [{msg : 'Server error'}] });
      }    
})


/*
    @api/users/getAllProfileUser
    Header : {
      x-auth-token
    }

*/
router.get('/getAllProfileUser',auth, async (req,res) => {
  try {
    let userObj = await USER.findById(req.id).select('-password');
    
    res.json({user : userObj});
  } catch (error) {
    res.status(501).json({msg : 'Server error'});
  }
    
})

/*
    @api/users/editAvatar
    file : {
      jpg, png
    }
*/
router.post('/editAvatar',auth,upload.single('avatarUser'), async (req,res) => {

  try {
    let userObj = await USER.findByIdAndUpdate(req.id , {avatar : req.file.path});

    res.json({msg : 'Update avatar successful'});
  } catch (error) {
    res.status(501).json({msg : 'Server error'});
  }
    
})

/*
    @api/users/editName
    param : {
      firstName,
      lastName
    }
*/
router.post('/editName',auth,
[
  check('firstName',`Firstname is not empty`).not().isEmpty(),
  check('lastName',`Lastname is not empty`).not().isEmpty()

],async (req,res) => {
  const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() });
      }

     let name = req.body.firstName + " " + req.body.lastName;
  try {
    let userObj = await USER.findByIdAndUpdate(req.id , {name});
    res.json({msg : 'Update your name successful'});
  } catch (error) {
    res.json({msg : 'Server error'});
  }
})

/*
    @api/users/pluspoints
    param : {
      point : {
        type : 'number'
      }
    }
*/
router.post('/pluspoints', 
 auth, 
 async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array()});
  }

  try {
    let userFind = await USER.findById(req.id);
    let plusPoint = await (userFind.point + 1);

    let userUpdatePoint = await USER.findByIdAndUpdate(req.id, {point : plusPoint});
    if(plusPoint === 7)
    {
      let userUpdatePointReturn = await USER.findByIdAndUpdate(req.id, {point : 0});
      let userUpdatePointReturn2 = await USER.findByIdAndUpdate(req.id, {coupons : 30});
      res.json({msg : `You have 8 point and you have coupons 30%`});
    }

    if(userFind.coupons !== 0)
    {
      let userUpdatePointReturn2 = await USER.findByIdAndUpdate(req.id, {coupons : 0});
    }
    res.json({msg : `You get 1 point`});



  } catch (error) {
    res.status(501).json({msg : 'Server error'});
  }
  
})

/*
    @api/users/getTop10User
*/
router.get('/getTop10User',auth, async (req,res) => {
  try {
    let userFind = await USER.find().select('-password').sort({'point' : -1}).limit(10);
    res.json({data : userFind});
  } catch (error) {
    res.json({msg : 'Server error'});
  }
})

const tests = require('./../../models/tests');

router.get('/getTests',auth, async (req,res) => {
      res.json(await tests.find().populate('users','email').select());
});

/*
    @api/users/getDataUser
*/
router.get('/getDataUser', auth , async (req,res) => {
    try {
      res.json(await USER.findById(req.id).select('-password'));
    } catch (error) {
      console.log(error);
      res.json({msg : 'Server error'});
    }
})

/*
    @api/users/getDataUser
*/
router.get('/getAllUser', auth,[
  check('page', 'Page is not empty').not().isEmpty(),
  check('page', 'Page is number').isNumeric(),
] , async (req,res) => {
  const errors = validationResult(req);
      if (!errors.isEmpty()) {
       
        return res.json({ errors: errors.array() });
      }

  try {
    
    const page = req.query.page;
    if(page < 0)
    {
        return res.json({errors: [{msg : 'Page must be greater than or equal to 0 '}]});
    }
   
    if(req.role === 'admin')
    {
      let AllUser = await USER.find().limit(10).skip(10*page).sort({point : -1}).select('-password');
      res.json({listUser : AllUser});
    }else{
      res.json({msg : 'You do not have access to this API'});
    }
  } catch (error) {
    console.log(error);
    res.json({msg : 'Server error'});
  }
})




module.exports = router;


