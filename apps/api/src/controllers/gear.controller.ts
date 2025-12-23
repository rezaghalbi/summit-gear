import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createGear = async (req: Request, res: Response) => {
  try {
    const { name, description, pricePerDay, stock, categoryId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const newGear = await prisma.gear.create({
      data: {
        name,
        description,
        pricePerDay: Number(pricePerDay),
        stock: Number(stock),
        categoryId: Number(categoryId),
        imageUrl: `/images/${file.filename}`,
      },
    });

    res.status(201).json({
      message: 'Gear created successfully',
      data: newGear,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAllGears = async (req: Request, res: Response) => {
  try {
    const gears = await prisma.gear.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      message: 'Get all gears success',
      data: gears,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getGearById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const gear = await prisma.gear.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!gear) {
      return res.status(404).json({ message: 'Gear not found' });
    }

    res.status(200).json({ data: gear });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
