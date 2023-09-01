import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import User from "../models/user.mjs"
import bcrypt from "bcrypt"

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
const createUser = async ( req, res ) => {
    const { username, email, password }  = req.params

    



}

//edit user 

//log into user account 

export {getUsers};


