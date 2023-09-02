import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import User from "../models/user.mjs"
import bcrypt from "bcrypt"
import validator from "validator";

//create token
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, {expiresIn: "7d"})
}

//get all users
const getUsers = async ( req, res ) => {
    const users = await User.find({})
    res.status(201).json(users)

}

//get a single users 
const getUser = async ( req, res ) => {
    const { username } = req.params
    const user = await User.find({username: username})

    if (!user ) {
        res.status(401).json({error: "User not found!"})
    } else {
        res.status(201).json(user)
    }

}

//create user
const createUser = async (req, res) => {
    const { username, email, password } = req.body
  
    let emptyFields = []
    if (!username) {
      emptyFields.push("username")
    } 
    if (!email) {
      emptyFields.push("email")
    } 
    if (!password) {
      emptyFields.push("password")
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash( password, salt )
  
    
    
    if (emptyFields.length > 0) {
      res.status(400).json({error: "All fields must be filled!", emptyFields})
    }
    else if (await User.findOne({username: username})) { 
      res.status(400).json({error: "Username is taken!"})
    }
    else if (await User.findOne({email: email})) { 
      res.status(400).json({error: "Email is taken!"})
    } 
    else if (!validator.isEmail(email)) {
      res.status(400).json({error: "Invalid Email!"})
    }
    else if (!validator.isStrongPassword(password)) {
      res.status(400).json({error: "Weak password! Try adding special characters and numbers."})
    }
    else {
  
      try {
        const newuser = await User.create({ username, email, password: hash })
  
        //create token 
        const token = createToken(newuser._id)
  
        res.status(201).json({newuser, token})
      } catch (error) {
        res.status(400).json({error: error.message})
      }
    }
  }

//edit user 
const updateUser = async (res, req) => {
    const { id } = req.params
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({error: "No such user!"})
    }
  
    const user = await User.findOneAndUpdate({_id: id}, {
      ...req.body
    })
  
    if (!user) {
      return res.status(404).json({error: "No such user!"})
    }
  
    res.status(200).json(user)
  }

//log into user account 
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    let emptyFields = []
  
    if (!email) {
      emptyFields.push("email")
    } 
    if (!password) {
      emptyFields.push("password")
    }
    if (emptyFields.length > 0) {
      return res.status(400).json({ error: "All fields must be filled!", emptyFields});
    }
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ error: "User does not exist" });
      }
  
      if (user.password) {
        const match = await bcrypt.compare(password, user.password);
  
        if (!match) {
          return res.status(401).json({ error: "Password is incorrect" });
        }
      }
  
      const token = createToken(user._id);
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  };

export {getUser, getUsers, createUser, updateUser, loginUser};


