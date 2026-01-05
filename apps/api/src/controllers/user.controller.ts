import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { hash, genSalt } from 'bcryptjs';

const prisma = new PrismaClient();

// 1. GET ALL USERS (Khusus Admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: 'Get users success',
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 2. UPDATE PROFILE (Ganti Nama / Password)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const id = req.user?.id; // Ambil ID dari Token
    const { name, password } = req.body;

    let updateData: any = { name };

    // Jika user kirim password baru, kita hash dulu
    if (password && password.trim() !== '') {
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
