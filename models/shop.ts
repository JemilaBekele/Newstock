import { IBranch } from './Branch';

export interface IShop {
  id: string;
  name: string;
  branchId: string;
  branch?: IBranch;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
