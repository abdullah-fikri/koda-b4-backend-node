import argon2 from "argon2";

export async function hashPassword(password) {
  return argon2.hash(password);
}

export async function verifyPassword(password, hashed) {
  return argon2.verify(hashed, password);
}
