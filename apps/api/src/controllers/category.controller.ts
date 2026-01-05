import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. CREATE Category (Hanya Admin)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    // Cek duplikasi
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 2. READ All Categories (Publik/User)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' }, // Urutkan dari ID kecil ke besar
    });

    res.status(200).json({
      message: 'Get all categories success',
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 3. READ Detail Category
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Ambil ID dari URL

    const category = await prisma.category.findUnique({
      where: { id: Number(id) }, // Convert string URL ke Number
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ data: category });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
