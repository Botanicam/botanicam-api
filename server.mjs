import cors from "cors"
import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import userRoutes from "./routes/userRoutes.mjs"

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(cors())

//routes
app.use("/api/users", userRoutes)

//connect to mongodb
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("connected to db")
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.log(error)
    })

