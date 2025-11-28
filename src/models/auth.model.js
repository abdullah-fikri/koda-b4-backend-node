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

export default {
    registerModel,
    loginModel,
};