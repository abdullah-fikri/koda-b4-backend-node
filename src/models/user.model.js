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

export default { getAllUser, getUserById };
