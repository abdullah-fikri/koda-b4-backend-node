import prisma from "../lib/prisma.js";
import {hashPassword} from "../lib/hashingPassword.js"

// get all user
async function getAllUser(search = "") {
  const where = {}
  if (search !== "") {
    where.profile = {
      username: {
        contains: search,
      }
    }
  }
  return await prisma.users.findMany({
    where,
    include: {
      profile: true,
    },
  });
}

// get user by id
async function getUserById(id){
    const result = await prisma.users.findUnique({
        where: {
            id: id
        },
        include: {
          profile: true
        }
    })
    return result
}


// update/edit user
async function updateUser(id, role, username, address, phone, profile_picture=null) {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      include: { profile: true }
    })

    if (!user) return null
    const data = {}

    if (role !== undefined) data.role = role

    data.profile = {
      update: {
        username: username ?? user.profile.username,
        address: address ?? user.profile.address,
        phone: phone ?? user.profile.phone,
        profile_picture: profile_picture ?? user.profile.profile_picture
      }
    }

    const updated = await prisma.users.update({
      where: { id },
      data
    })

    return updated
  } catch (error) {
    return null
  }
}



/// remove user
async function removeUser(id){
  try {
    await prisma.profile.deleteMany({
      where: { users_id: id }
    });

    await prisma.users.delete({
      where: { id }
    });

    return true;

  } catch (error) {
    return false;
  }
}


// user
// get my profile
async function getMyProfile(id) {
  const result = await prisma.users.findUnique({
      where: { id },
      include: {
          profile: true
      }
  })
  return result
}

// update my profile
async function updateMyProfile(id, username,password,  address, phone, profile_picture = null) {
  try {
      const user = await prisma.users.findUnique({
          where: { id },
          include: { profile: true }
      });

      if (!user) return null;

      const data = {
          profile: {
              update: {
                  username: username ?? user.profile.username,
                  address: address ?? user.profile.address,
                  phone: phone ?? user.profile.phone,
                  profile_picture: profile_picture ?? user.profile.profile_picture
              }
          }
      };

      if (password) {
        const hashed = await hashPassword(password);
        data.password = hashed; 
      }
  
      return await prisma.users.update({
        where: { id },
        data,
        include: { profile: true },
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }


export default { getAllUser, getUserById, updateUser, removeUser, getMyProfile, updateMyProfile };
