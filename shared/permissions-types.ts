export interface UserPermission {
  id: number;
  user_id: string;
  permission: string;
  granted_at: Date;
  granted_by?: string;
}

export interface UserPermissionsSummary {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  permission_count: number;
}