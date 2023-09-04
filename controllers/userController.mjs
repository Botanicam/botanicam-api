import mongoose from "mongoose";
import User from "../models/user.mjs"
import bcrypt from "bcrypt"

//get all users
export const getUsers = async ( req, res ) => {
    const users = await User.find()

    return res.status(200).json({
        success: true,
        data: users
    })
}

//get a single users 
export const getUser = async ( req, res ) => {
    const { username } = req.params
    const user = await User.find({username: username})

    if (!user ) {
        return res.status(404).json({
            success: false,
            error: "No such user"
        })
    } else {
        return res.status(200).json({
            success: true,
            data: user
        })
    }
}

//create user
export const createUser = async (req, res) => {
    const { username, email, password } = req.body;

    // errors handled by validator
    try {
        // Return error if username or email already exists
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            // username or email already exists?
            if (userExists.username === username) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already exists'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists'
                });
            }
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password
        });

        // Save user to database
        await newUser.save();

        // Create token
        const token = newUser.getSignedJwtToken();

        // Return success message
        return res.status(200).json({
            success: true,
            message: 'User registered successfully',
            token
        });

    } catch (error) {
        // may be validation error
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: error.message,
            })
        }

        // or dupe key
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: "Username or email already exists",
            })
        }

        console.log(error);
        
        return res.status(500).json({
            success: false,
            error: "An error occurred",
        })
    }
}

//log into user account 
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email })
            .select("+password")
        if (user) {
            // Check if password is correct
            const isMatch = await user.matchPassword(password);
            if (isMatch) {
                // Sign JWT and return
                const token = user.getSignedJwtToken();

                return res.status(200).json({
                    success: true,
                    message: 'User logged in successfully',
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }
                });

            } else {
                return res.status(400).json({
                    success: false,
                    error: 'Incorrect password'
                });
            }
        } else {
            return res.status(404).json({
                success: false,
                error: 'User does not exist'
            });
        }
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: error.message,
            })
        }
        
        return res.status(500).json({ error: "An error occurred" });
    }
};

//doesUser contribute to dataset

export const doesUserContribute = async (req,res) => {
  const { id } = req.params

  //check if id exists
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({
      success: false,
      error: "User does not exist"
    })
  }

  const user = User.findOne( { _id: id } )
  const currState = user.doesContribute
  const newState = !currState

  //if id exists then find and update by id
  try {
    const updateUser = await User.updateOne({_id: id}, {
        doesContribute: newState
    })

    res.status(200).json({
        success: true,
        message: "state changed",
        user: {
            id: user._id,
            username: user.username,
            doesContribute: user.doesContribute
        }

    })
  } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })

  }


}