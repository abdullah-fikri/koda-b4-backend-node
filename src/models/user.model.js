import prisma from "../lib/prisma.js";

// get all user
async function getAllUser(search = "") {
  return await prisma.user.findMany({
    where: {
      profile: {
        fullname: {
          contains: search,
        },
      },
    },
    include: {
      profile: true,
    },
  });
}

// get user by id
async function getUserById(id){
    const result = await prisma.user.findUnique({
        where: {
            id: id
        }
    })
    return result
}


// update/edit user
async function updateUser(id, role, fullname, address, phone) {
  try {
    const data = {}
    if (role !== undefined) {
      data.role = role
    }

    if (fullname !== undefined || address !== undefined || phone !== undefined) {
      data.profile = {
        update: {}
      }

      if (fullname !== undefined) data.profile.update.fullname = fullname
      if (address !== undefined) data.profile.update.address = address
      if (phone !== undefined) data.profile.update.phone = phone
    }

    const updated = await prisma.user.update({
      where: { id },
      data
    })

    return updated
  } catch (error) {
    console.log(error)
    return null
  }
}


/// remove user
async function removeUser(id){
  try {
    await prisma.profile.deleteMany({
      where: { userId: id }
    });

    await prisma.user.delete({
      where: { id }
    });
    
    return true;

  } catch (error) {
    return false;
  }
}


export default { getAllUser, getUserById, updateUser, removeUser };
