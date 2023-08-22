const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const dbConnect = require('./db/dbConnect');
const User = require('./db/userModel');
const jwt = require('jsonwebtoken');


// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res, next) => {
  res.json({ message: "Hey! This is your server response!" });
  next();
});


dbConnect();

app.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, 10)
    .then((hashedPassword) => {

      const user = new User({
        email: req.body.email,
        password: hashedPassword
      })

      user.save().then((result) => {
        
        res.status(201).send({
          message: "User created successfully", result
        });

      })
      .catch((error) => {
        
        res.status(500).send({
          message: "Error creating user", error
        });

      })

    })
    .catch((error) => {
      res.status(500).send({
        message: "Password was not hashed successfully", error
      });
    });
});

app.post('/login', (req, res) => {

  User.findOne({ email: req.body.email })
  .then((user) => {

    bcrypt.compare(req.body.password, user.password)
    .then((result) => {
      if(!result) {
        return res.status(400).send({
          message: "Passwords does not match",
          error,
        });
      }

      const token = jwt.sign({

        userId: user._id,
        userEmail: user.email
      }, 
      "RANDOM-TOKEN", 
      {expiresIn: "24h"}
      
      );

      res.status(200).send({
        message: "Login Successful",
        email: user.email,
        token
      });

    })
    .catch((error) => {

      res.status(400).send({
        message: "Password does not match", error
      });

    });
  
  })
  .catch((error) => {

    res.status(404).send({
      message: "User not found", error
    });

  });

});

module.exports = app;