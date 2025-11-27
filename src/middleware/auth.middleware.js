import jwt from "jsonwebtoken"

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
*/

function authMiddleware(req, res, next){
    const bearer = req.headers?.authorization;
    if(!bearer || !bearer.startsWith("Bearer ")){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    const token = bearer.substring("Bearer ".length)
    try {
        const payload = jwt.verify(token, process.env.APP_SECRET)
        req.jwtpayload = payload
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
}
export default authMiddleware