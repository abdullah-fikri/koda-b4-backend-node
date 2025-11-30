import upload from "../lib/upload.js";
import userModel from "../models/user.model.js";

const {
    getAllUser,
    getUserById,
    updateUser,
    removeUser,
    getMyProfile,
    updateMyProfile,
} = userModel

/**
 * GET /admin/user
 * @summary Get all users (admin only)
 * @tags admin-users
 * @security bearerAuth
 * @param {string} search.query - Search by username
 * @returns {object} 200 - List of users
 */
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

/**
 * GET /admin/user/{id}
 * @summary Get user by ID (admin only)
 * @tags admin-users
 * @security bearerAuth
 * @param {number} id.path - User ID
 * @returns {object} 200 - User detail
 */
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

/**
 * PATCH /admin/user/{id}
 * @summary Update user by admin
 * @tags admin-users
 * @security bearerAuth
 * @param {number} id.path - User ID
 * @param {string} request.body.role - New role
 * @param {string} request.body.username - Username
 * @param {string} request.body.address - Address
 * @param {string} request.body.phone - Phone
 * @returns {object} 200 - Updated user
 */
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

/**
 * DELETE /admin/user/{id}
 * @summary Delete user (admin only)
 * @tags admin-users
 * @security bearerAuth
 * @param {number} id.path - User ID
 * @returns {object} 200 - Delete success
 */
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


/**
 * PATCH /admin/user/{id}/image
 * @summary Upload profile picture (admin only)
 * @tags admin-users
 * @security bearerAuth
 * @param {number} id.path - User ID
 * @param {file} image.formData - Profile image
 * @returns {object} 200 - Upload success
 */
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


/**
 * GET /user/profile
 * @summary Get my profile
 * @tags user
 * @security bearerAuth
 * @returns {object} 200 - My profile data
 */
//user 
async function getMyProfileController(req, res) {
    try {
        const id = req.jwtpayload.id;

        const result = await getMyProfile(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "My profile",
            result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * PATCH /user/profile
 * @summary Update my profile
 * @tags user
 * @security bearerAuth
 * @param {string} request.body.username - New username
 * @param {string} request.body.address - New address
 * @param {string} request.body.phone - New phone
 * @returns {object} 200 - Profile updated
 */
async function updateMyProfileController(req, res) {
    try {
        const id = req.jwtpayload.id;
        const { username, address, phone } = req.body;

        const updated = await updateMyProfile(id, username, address, phone);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            result: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * PATCH /user/image
 * @summary Upload my profile picture
 * @tags user
 * @security bearerAuth
 * @param {file} image.formData - Profile image
 * @returns {object} 200 - Upload success
 */
async function uploadMyProfilePictureController(req, res) {
    const id = req.jwtpayload.id;  

    const user = await getUserById(id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    upload.single("image")(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "File not available"
                });
            }

            const updated = await updateMyProfile(
                id,
                null, 
                null, 
                null, 
                req.file.filename 
            );

            return res.status(200).json({
                success: true,
                message: "Profile picture updated successfully",
                result: updated
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    });
}


export default {
     getAllUserController, 
     getUserByIdController, 
     updateUserController, 
     removeUserController, 
     uploadProfilePicture, 
     getMyProfileController, 
     updateMyProfileController,
     uploadMyProfilePictureController,
}