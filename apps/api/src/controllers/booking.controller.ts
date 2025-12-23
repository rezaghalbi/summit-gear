import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, items } = req.body;
    const userId = (req as any).user.id;

    // 1. hitung durasi sewa
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (durationInDays < 1) {
      return res
        .status(400)
        .json({ message: 'Minimum rental duration is 1 day' });
    }

    // 2. Cek Barang & Hitung Total
    let calculatedTotal = 0;

    const bookingItemData = await Promise.all(
      items.map(async (item: any) => {
        const gear = await prisma.gear.findUnique({
          where: { id: item.gearId },
        });

        if (!gear) {
          throw new Error(`Gear with ID ${item.gearId} not found`);
        }

        if (gear.stock < item.quantity) {
          throw new Error(`Stock for ${gear.name} is not enough`);
        }

        const subTotal = gear.pricePerDay * item.quantity * durationInDays;
        calculatedTotal += subTotal;

        return {
          gearId: item.gearId,
          quantity: item.quantity,
          price: gear.pricePerDay,
        };
      })
    );

    // 3. Simpan Transaksi ke Database
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        startDate: start,
        endDate: end,
        totalPrice: calculatedTotal,
        status: 'PENDING',
        items: {
          create: bookingItemData,
        },
      },
      include: {
        items: {
          include: { gear: true },
        },
      },
    });

    res.status(201).json({
      message: 'Booking created successfully',
      data: newBooking,
    });
  } catch (error: any) {
    console.error(error);

    if (error.message.includes('Stock') || error.message.includes('found')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// 2. USER: Lihat Booking Saya
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: { gear: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: bookings });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 3. ADMIN: Lihat Semua Booking
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        items: {
          include: { gear: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: bookings });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 4. ADMIN: Update Status (Misal: PENDING -> PAID)
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      message: `Booking status updated to ${status}`,
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
