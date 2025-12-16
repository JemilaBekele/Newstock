import { IRole } from '@/service/roleService';
import { IBranch } from './Branch';
import { IShop } from './shop';
import { IStore } from './store';

export interface IEmployee {
  id?: string; // UUID
  name: string;
  phone?: string;
  userCode?: string;
  email: string;
  password: string;
  branchId?: string;
  branch?: IBranch;
  roleId: string;
  role?: IRole;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  lastLoginAt?: string;
  shopIds?: string[]; // for assigning shops
  storeIds?: string[]; // for assigning stores
  shops?: IShop[]; // populated shops (optional in responses)
  stores?: IStore[]; // ISO date string
}
export interface Imployee {
  id: string; // UUID
  name: string;
  phone?: string;
  userCode?: string;
  email: string;
  password: string;
  branchId?: string;
  branch?: IBranch;
  roleId: string;
  role?: IRole;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  lastLoginAt?: string;
  shopIds?: string[]; // for assigning shops
  storeIds?: string[]; // for assigning stores
  shops?: IShop[]; // populated shops (optional in responses)
  stores?: IStore[]; // ISO date string
}

export interface Iupdate {
  id?: string;
  name: string;
  email: string;
  role:
    | 'Resident'
    | 'Owner'
    | 'Renter'
    | 'ShopOwner'
    | 'Maintenance'
    | 'Accountant'
    | 'Admin'
    | 'None';
  phone: string;
  status: 'Active' | 'Inactive' | 'Suspended'; // Extended status options
  confirm?: boolean; // Optional confirm field added
}
export interface ITenant {
  id?: string; // Corresponds to _id from MongoDB
  name: string;
  email: string;
  password: string;
  role: 'Owner' | 'Renter' | 'None';
  phone?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt?: string;
  updatedAt?: string;
}

export interface ICompany {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  tinAddress?: string;
  TIN?: string;
  From?: string;
  logo?: string | File;
  // Relationships

  // Timestamps
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
