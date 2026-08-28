import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function userSeeders() {
  console.log('🌱 Seeding users...');


  const users = [
    {
      name: "Preview",
      email: "preview@gmail.com",
      password: "preview1234&",
      role: UserRole.user,
      username: "preview",
    },
    // {
    //   name: "Andy",
    //   email: "andywidianto56@gmail.com",
    //   password: "andy12345",
    //   role: UserRole.user,
    //   username: "andywidianto",
    // },
    // {
    //   name: "Admin",
    //   email: "admin1234@gmail.com",
    //   password: "andy12345",
    //   role: UserRole.admin,
    //   username: "admin1234",
    // }
  ];

  for (const user of users) {
    const hashPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: hashPassword
      },
    });
  }

  console.log('✅ User seeding completed.');
}

userSeeders();