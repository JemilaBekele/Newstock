export interface ICustomer {
  id?: string;
  name: string; // mapped from "first_name"
  phone1: string; // primary phone
  phone2?: string; // optional secondary phone
  tinNumber?: string; // TIN number
  address?: string;
  companyName?: string; // added companyName
  createdAt?: string;
  updatedAt?: string;
}
