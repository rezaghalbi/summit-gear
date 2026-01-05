import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { supabase } from '../config/supabase';

const prisma = new PrismaClient();

export const createGear = async (req: Request, res: Response) => {
  try {
    const { name, pricePerDay, description, categoryId, stock } = req.body;
    let imageUrl = '';

    // LOGIKA BARU: Upload ke Supabase Storage
    if (req.file) {
      const file = req.file;
      // Buat nama file unik
      const fileName = `gear-${Date.now()}-${file.originalname.replace(
        /\s/g,
        '-'
      )}`;

      const { data, error } = await supabase.storage
        .from('gears') // Nama bucket tadi
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;

      // Ambil Public URL
      const { data: publicData } = supabase.storage
        .from('gears')
        .getPublicUrl(fileName);

      imageUrl = publicData.publicUrl;
    }

    // Simpan ke Database
    const gear = await prisma.gear.create({
      data: {
        name,
        description,
        pricePerDay: Number(pricePerDay),
        stock: Number(stock),
        categoryId: Number(categoryId),
        imageUrl: imageUrl, // URL dari Supabase
      },
    });

    res.status(201).json({ message: 'Success', data: gear });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating gear' });
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
