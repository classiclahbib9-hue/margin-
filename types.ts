export type SortKey = keyof Laptop;
export type SortDirection = 'ascending' | 'descending';

export interface Laptop {
  id: string;
  model: string;
  location: 'center' | 'sud';
  supplier: string; // 'fournisseur'
  purchaseDate: string;
  purchasePrice: number;
  isSold: boolean;
  client?: string;
  saleDate?: string;
  salePrice?: number;
  profit?: number;
  profitPercentage?: number;
  partnerShare?: number;
}

export interface PartnerPayment {
  id: string;
  amount: number;
  date: string;
  paymentType: 'cash' | 'baridi-mob';
}