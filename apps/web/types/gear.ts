export interface Category {
  id: number;
  name: string;
}

export interface Gear {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
  category: Category;
}
