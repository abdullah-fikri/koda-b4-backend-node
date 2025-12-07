import { error } from "console";
import prisma from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/hashingPassword.js";


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

//cek password lama
async function CheckPassword(email, oldPassword, newPassword) {
  const user = await prisma.users.findUnique({
    where: { email },
    select: { password: true },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (oldPassword) {
    const isOldCorrect = await verifyPassword(oldPassword, user.password);
    if (!isOldCorrect) {
      return { success: false, message: "the old password is wrong" };
    }
  }

  const isSameAsOld = await verifyPassword(newPassword, user.password);
  if (isSameAsOld) {
    return { success: false, message: "The new password cannot be the same as the old password" };
  }
  return { success: true };
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
    updateUserPasswordModel,
    CheckPassword
};