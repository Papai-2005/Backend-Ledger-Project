const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blackList.model")




async function authMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token is missing"
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({token:token})

    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Unauthorized access, token is blacklisted"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)

        if(!user){
            return res.status(401).json({
                message:"Unauthorized access, user not found"
            })
        }

        req.user = user
        next()
    }catch(err){
        return res.status(401).json({
            message:"Unauthorized access, token is invalid"
        })
    }
}

async function authSystemUserMiddleware(req, res, next){

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]


    if(!token){
        return res.status(401).json({
            message:"Unauthorized access, token is missing"
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({token:token})

    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Unauthorized access, token is blacklisted"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+systemUser")

        if(!user){
            return res.status(401).json({
                message:"Unauthorized access, user not found"
            })
        }

        req.user = user

        return next()
    }

    catch(err){
        return res.status(401).json({
            message:"Unauthorized access, token is invalid"
        })
    }
}


module.exports={
    authMiddleware,
    authSystemUserMiddleware
}

