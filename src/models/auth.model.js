import prisma from "../lib/prisma.js";


async function registerModel(username, email, password) {
    const newUser = await prisma.users.create({
      data: {
        email,
        password,
        profile: { create: { username } } },
      include: {
        profile: true
      }
    });
    return newUser;
}

async function loginModel(email) {
    const user = await prisma.users.findUnique({
        where: { email }
    });
    return user;
}

// forgot password 
async function forgotPasswordModel(email) {
  return prisma.users.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });
}

// reset password
async function updateUserPasswordModel(email, hashedPassword) {
  return prisma.users.update({
    where: { email },
    data: { password: hashedPassword },
  });
}


export default {
    registerModel,
    loginModel,
    forgotPasswordModel,
    updateUserPasswordModel
};