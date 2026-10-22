const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlacklistModel = require("../models/blackList.model")

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.JWT_SECRET === "production"
}

/** 
* - user register controller
* - POST /api/auth/register
*/

async function userRegisterController(req, res){
        const{email, password, name} = req.body

        const isExists = await userModel.findOne({
            email:email
        })


        if(isExists){
            return res.status(422).json({
                message: "User already exists with this email......",
                status: "failed"
            })
        }

        const user = await userModel.create({
            email, password, name
        })

        const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET)

        res.cookie("token", token, cookieOptions)

        res.status(201).json({
            user:{
                _id:user._id,
                email:user.email,
                name:user.name
            },
            token
        })

        await emailService.sendRegisterationEmail(user.email, user,name)

}


/**
 * - user Login Controller
 * - POST /api/auth/login
 */

async function userLoginController(req, res){
    const {email, password} = req.body

    const user = await userModel.findOne({email}).select("+password")

    if(!user){
        return res.status({
            message:"Email or Password is invalid"
        })
    }

    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({
            message: "Email or Password is invalid"
        })
    }

    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET)

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
}

/**
 * -User Logout Controller
 * - POST /api/auth/logout
 */
async function userLogoutController(req, res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(400).json({
            message:"Token is missing, user is not logged in"
        })
    }

    res.cookie("token", "")
    await tokenBlacklistModel.create({token:token})

    res.clearCookie("token", cookieOptions)

    return res.status(200).json({
        message:"User logged out successfully"
    })
}


module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}