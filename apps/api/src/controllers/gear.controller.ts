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
    // 1. Tangkap Query dari URL (contoh: ?search=tenda&cat=1)
    const { search, cat } = req.query;

    // 2. Siapkan Filter (Where Clause)
    let whereClause: any = {};

    // Jika ada pencarian nama
    if (search) {
      whereClause.name = {
        contains: String(search), // Cari yang namanya mengandung kata ini
        // mode: 'insensitive', // Opsional: Agar tidak peduli huruf besar/kecil (Cek DB Anda support ini atau tidak)
      };
    }

    // Jika ada filter kategori
    if (cat) {
      whereClause.categoryId = Number(cat);
    }

    // 3. Ambil Data dengan Filter
    const gears = await prisma.gear.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      message: 'Get gears success',
      data: gears,
    });
  } catch (error) {
    console.error(error); // Penting untuk debugging
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
export const updateGear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, pricePerDay, stock, categoryId } = req.body;

    // Cek apakah barang ada?
    const existingGear = await prisma.gear.findUnique({
      where: { id: id }, // <-- JANGAN pakai Number(id)
    });

    if (!existingGear) {
      return res.status(404).json({ message: 'Gear not found' });
    }

    // Lakukan Update
    const updatedGear = await prisma.gear.update({
      where: { id: id }, // <-- JANGAN pakai Number(id)
      data: {
        name,
        description,
        pricePerDay: Number(pricePerDay), // Kalau harga tetap Number
        stock: Number(stock), // Stok tetap Number
        categoryId: Number(categoryId), // CategoryId tetap Number
      },
    });

    res.status(200).json({
      message: 'Gear updated successfully',
      data: updatedGear,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// --- DELETE GEAR (Hapus Barang) ---
export const deleteGear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cek barang
    const existingGear = await prisma.gear.findUnique({
      where: { id: id }, // <-- JANGAN pakai Number(id)
    });

    if (!existingGear) {
      return res.status(404).json({ message: 'Gear not found' });
    }

    // Hapus
    await prisma.gear.delete({
      where: { id: id }, // <-- JANGAN pakai Number(id)
    });

    res.status(200).json({
      message: 'Gear deleted successfully',
    });
  } catch (error) {
    console.error(error);
    // @ts-ignore
    if (error.code === 'P2003') {
      return res
        .status(400)
        .json({ message: 'Cannot delete gear because it is used in bookings' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
