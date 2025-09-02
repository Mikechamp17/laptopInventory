export interface Laptop {
  id?: string;
  asset_tag: string;
  make: string;
  assigned_to?: string;
  assigned_date?: string;
  returned: boolean;
  issues: string;
  notes: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface LaptopStatus {
  available: Laptop[];
  assigned: Laptop[];
  damaged: Laptop[];
}
