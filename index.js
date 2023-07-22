const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserModel = require("./models/User");
const Place = require("./models/Place");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const imageDownloader = require('image-downloader')
const multer = require('multer')
const fs = require('fs');
const BookingModel = require("./models/Booking");

const bcryptSaltKey = bcrypt.genSaltSync(10);
const jwtSecretKey = "#############################";

require("dotenv").config();

const app = express();

// JSON Middleware to read HTML POST Form data
app.use(express.json());

// Middleware so we can communicate through cookies
app.use(cookieParser());

// Our own middleware
app.use('/uploads', express.static(__dirname + '/uploads'))

// CORS Middleware to communicate between various ports
app.use(
  cors({
    credentials: true,
    origin: "http://127.0.0.1:5173",
  })
);

// Database connection
console.log(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL);

function getUserDataFromToken(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecretKey, {}, async (err, tokenCookieUserData) => {
      if (err) throw err;
      resolve(tokenCookieUserData)
    });
  })
}


// Test if app works
app.get("/test", (req, res) => {
  res.json("test ok");
});

// Might 1. need to work on validation, sanitize input; 2. Need to work more on the error handling;
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newlyCreatedUser = await UserModel.create({
      name,
      email,
      // We create the hashed password
      password: bcrypt.hashSync(password, bcryptSaltKey),
    });

    res.json(newlyCreatedUser);
  } catch (e) {
    res.status(422).json(e);
  }
});

// Might 1. need to work on preventing brute force attacks; 2. be secure against "timing attacks" by maybe using constant-time comparison method such as "crypto.timingSafeEqual" for comapring password; 3. Work more on error handling
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userCheckAvailable = await UserModel.findOne({ email: email });

  if (userCheckAvailable) {
    // We compare passwords and the synchronization between the password inserted in HTML input form and the one salted in the database 
    const checkPasswordPositive = bcrypt.compareSync(
      password,
      userCheckAvailable.password
    );

    if (checkPasswordPositive) {
      // First we sign the JWT that contains the user's identity, by signing it, the server can verify its authenticity and integrity. It is a good approach to use JWT because the server doesn't need to store session data on the server-side but simply on the user's browser.
      jwt.sign(
        { email: userCheckAvailable.email, id: userCheckAvailable._id },
        jwtSecretKey,
        {},
        (err, token) => {
          if (err) {
            throw err;
          }
          res
          // We create the cookie assigning it the JWT token created before so it is unique. We use the parameter "secure: true" because it ensures that the cookies is only transmitted over secure HTTPS connections, this way it doesn't get intercepted by attackers. The "sameSite: none" parameters allows the cookies to be sent in cross-site requests, which is necessary for some applications such as this one but it should be carefully considered in terms of security implications.
            .cookie("token", token, { secure: true, sameSite: "none" })
            .json(userCheckAvailable);
        }
      );
    } else {
      res.status(422).json("password not ok");
    }
  } else {
    res.json("not found");
  }
});

app.get("/profile", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Enable sending cookies with the response (if needed)

  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, jwtSecretKey, {}, async (err, tokenCookieUserData) => {
      if (err) throw err;
      const { name, email, _id } = await UserModel.findById(
        tokenCookieUserData.id
      );
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json(true)
})

app.post('/upload-by-link', async (req, res) => {
  const {link} = req.body
  const newName = 'photo' + Date.now() + '.jpg'

  await imageDownloader.image({
    url: link,
    dest: __dirname + '/uploads/' + newName,
  })

  res.json(newName)
})

// Multer middleware
const photosMiddleware = multer({dest: 'uploads/'})

app.post('/upload', photosMiddleware.array('photos', 5), (req, res) => {
  const uploadedFiles = []

  for (let i = 0; i < req.files.length; i++) {
    const {path, originalname} = req.files[i]
    const parts = originalname.split('.')
    const extension = parts[parts.length - 1]

    const newPath = path + '.' + extension

    fs.renameSync(path, newPath)
  
    uploadedFiles.push(newPath.replace('uploads\\', ''))
  }

  res.json(uploadedFiles)
})

app.post('/places', (req, res) => {
  const {token} = req.cookies
  const {title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price} = req.body

  jwt.verify(token, jwtSecretKey, {}, async (err, tokenCookieUserData) => {
    if (err) throw err;
    const placeDocument = await Place.create({
      owner: tokenCookieUserData.id,
      title, address, photos:addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price, 
    })

    res.json(placeDocument)
  
  });
})

app.get('/user-places', (req, res) => {
  const {token} = req.cookies

  jwt.verify(token, jwtSecretKey, {}, async (err, tokenCookieUserData) => {
    const {id} = tokenCookieUserData
    res.json( await Place.find({owner:id}) )
  });
})

app.get('/places/:id', async (req, res) => {
  // res.json(req.params)
  const {id} = req.params

  res.json(await Place.findById(id))
})

app.put('/places', async (req, res) => {
  const {token} = req.cookies

  const {id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price} = req.body

  jwt.verify(token, jwtSecretKey, {}, async (err, tokenCookieUserData) => {
    if (err) throw err;
    const placeDocument = await Place.findById(id)
    if (tokenCookieUserData.id === placeDocument.owner.toString()) {
      placeDocument.set(
        {
          title, address, photos:addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price, 
        }
      )
      await placeDocument.save()
      res.json('ok')
    }
  });
})

app.get('/places', async (req, res) => {
  res.json(await Place.find())
})

app.post('/bookings', async (req, res) => {
  const userData = await getUserDataFromToken(req)


  const {place, checkIn, checkOut, maxGuests, name, phone, price} = req.body


  await BookingModel.create({
    place, checkIn, checkOut, maxGuests, name, phone, price,
    user: userData.id,
  }).then((doc) => {
    res.json(doc)
  }).catch((err) => {
    throw err
  }) 
});

app.get('/bookings', async (req, res) => {
  const userData = await getUserDataFromToken(req)
  res.json(await BookingModel.find({user: userData.id}).populate('place'))
})

app.listen(4000);
