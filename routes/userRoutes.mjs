import express from "express"

import {getUser, getUsers, createUser, loginUser} from "../controllers/userController.mjs"

const router = express.Router()

router.get("/", getUsers)

router.get("/:username", getUser)

router.post("/signup", createUser)

router.post("/login", loginUser)

export default router