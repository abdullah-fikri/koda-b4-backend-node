import userModel from "../models/user.model.js";

const {
    getAllUser,
    getUserById,
    updateUser
} = userModel

async function getAllUserController(req, res){
    try {
        const {search=''} = req.query;
        let results = await getAllUser(search)

        res.status(200).json({
            success: true,
            message: "list all user",
            results
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function getUserByIdController(req, res){
    try {
        const id = parseInt(req.params.id)
        const result = await getUserById(id)

        if (!result){
            return res.status(400).json({
                success: false,
                message: "user not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "user found",
            result
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function updateUserController(req, res){
    try {
        const id = parseInt(req.params.id)
        let role, fullname,address, phone = req.body

        const updated = await updateUser(id, role, fullname, address, phone)
        if (!updated){
            return res.status(500).json({
                success: false,
                message: "user not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "updated successfully",
            result: updated
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export default { getAllUserController, getUserByIdController, updateUserController }