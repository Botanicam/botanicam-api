import express from "express"

import {getUsers} from "../controllers/userController.mjs"

const router = express.Router()

router.get("/", getUsers)