import prisma from "../lib/prisma.js";


async function registerModel(fullname, email, password) {
    const newUser = await prisma.users.create({
      data: {
        email,
        password,
        profile: { create: { fullname } } },
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

export default {
    registerModel,
    loginModel,
};