export interface AssignmentHistory {
  assigned_to: string;
  from_date: string;
  to_date: string;
}

export interface Laptop {
  id?: string;
  asset_tag: string;
  make: string;
  ram?: string;
  assigned_to?: string;
  assigned_date?: string;
  returned: boolean;
  damaged: boolean;
  issues: string;
  notes: string;
  additional_equipment?: string;
  assignment_history: AssignmentHistory[];
  jumpcloud_installed: boolean;
  webroot_installed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface LaptopStatus {
  available: Laptop[];
  assigned: Laptop[];
  damaged: Laptop[];
}
