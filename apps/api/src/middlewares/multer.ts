import multer from 'multer';
import path from 'path';

// Konfigurasi Lokasi & Nama File
const storage = multer.memoryStorage();

// Filter: Hanya boleh upload gambar
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

export const uploader = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2MB
});
