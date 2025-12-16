export interface ICategory {
  id: string; // UUID string
  name: string;

  products?: any[]; // Replace 'any' with IProduct[] if you have a Product model
  subCategories?: ISubCategory[];

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ISubCategory {
  id: string; // UUID string
  name: string;

  categoryId: string; // UUID string
  category?: ICategory;

  products?: any[]; // Replace 'any' with IProduct[] if needed

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
