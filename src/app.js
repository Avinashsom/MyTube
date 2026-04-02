import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors";

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: "16kb"})) //manage data comes from frontend in json fromat on backend

app.use(express.urlencoded({extended: true, limit: "16kb"})) // manage data comes from url

app.use(express.static("public")) // store image in public folder

app.use(cookieParser()) // manage the cookie on user browser

export { app }