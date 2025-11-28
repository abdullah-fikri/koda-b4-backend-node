import upload from "../lib/upload.js";
import userModel from "../models/user.model.js";

const {
    getAllUser,
    getUserById,
    updateUser,
    removeUser,
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
        const { role, username, address, phone } = req.body;

        const updated = await updateUser(id, role, username, address, phone)
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

async function removeUserController(req, res){
    try {
        const id = parseInt(req.params.id)
        const deleted = await removeUser(id)

        if (!deleted){
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "user deleted"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// upload image profile
async function uploadProfilePicture(req, res){
    const id = parseInt(req.params.id)
    const user = await getUserById(id)

    if (!user){
        return res.status(404).json({
            success: false,
            message: "user not found"
        })
    }

    upload.single("image")(req, res, async (err) => {
        try {
            if (err){
                return res.status(400).json({
                    success: false,
                    message: err.message
                })
            }

            if (!req.file){
                return res.status(400).json({
                    success: false,
                    message: "file not available"
                })
            }
            const upload = await updateUser(id, user.role, null, null, null, req.file.filename)

            return res.status(200).json({
                success: true,
                message: "upload successfully",
                result: upload
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    })
}

export default { getAllUserController, getUserByIdController, updateUserController, removeUserController, uploadProfilePicture }