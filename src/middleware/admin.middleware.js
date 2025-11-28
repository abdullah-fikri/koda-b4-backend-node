/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
*/

function adminOnly(req, res, next) {
    const user = req.jwtpayload; 

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    if (user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Admin only"
        });
    }

    next();
}

export default adminOnly;
