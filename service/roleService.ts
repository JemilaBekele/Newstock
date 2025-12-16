import { IncomingMessage } from 'http';
import { axiosWithAuth } from './cli';
import { api } from './api';

// Role type
export interface IRole {
  id?: string;
  name: string;
  description?: string;
  permissions?: string[]; // array of permission IDs or names
}
export interface IPermission {
  id: string;
  name: string; // e.g., "CREATE_SUPPLIER"
  description?: string;
  createdAt: string; // ISO date string
  updatedAt: string;
}
export interface IRolePermission {
  id: string;
  roleId: string;
  permissionId: string;

  // Optional populated relations
  role?: IRole;
  permission?: IPermission;
}

// ============================
// Role CRUD Operations
// ============================

export const createRole = async (data: IRole, req?: IncomingMessage) => {
  const axios = axiosWithAuth(req);
  const res = await axios.post('/roles', data);
  return res.data;
};
export interface GetParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface RoleResponse {
  success: boolean;
  count: number;
  roles: IRole[];
}

export const getAllRoles = async ({
  page = 1,
  limit = 10,
  startDate,
  endDate
}: GetParams = {}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    // Add date filters to query if they exist
    if (startDate) {
      query.append('startDate', startDate);
    }
    if (endDate) {
      query.append('endDate', endDate);
    }

    const url = `roles?${query}`;

    const response = await api.get<RoleResponse>(url);
    const roles = response.data.roles;

    return {
      roles: roles,
      totalCount: response.data.count ?? roles.length,
      success: response.data.success
    };
  } catch (error) {
    throw error;
  }
};

export const getRoleall = async (req?: IncomingMessage) => {
  const axios = axiosWithAuth(req);
  const res = await axios.get(`/roles`);
  return res.data.roles;
};

export const getRoleById = async (id: string, req?: IncomingMessage) => {
  const axios = axiosWithAuth(req);
  const res = await axios.get(`/roles/${id}`);
  return res.data;
};

export const getRoleByName = async (name: string, req?: IncomingMessage) => {
  const axios = req ? axiosWithAuth(req) : api;
  const res = await axios.get(`/roles/name/${name}`);
  return res.data;
};

export const updateRole = async (
  id: string,
  data: Partial<IRole>,
  req?: IncomingMessage
) => {
  const axios = axiosWithAuth(req);
  const res = await axios.put(`/roles/${id}`, data);
  return res.data;
};

export const deleteRole = async (id: string, req?: IncomingMessage) => {
  const axios = axiosWithAuth(req);
  const res = await axios.delete(`/roles/${id}`);
  return res.data;
};

// ============================
// Role-Permission Relationships
// ============================

export const assignPermissionsToRole = async (
  roleId: string,
  permissionIds: string[],
  req?: IncomingMessage
) => {
  const axios = req ? axiosWithAuth(req) : api;
  const res = await axios.post(`/roles/${roleId}/permissions`, {
    permissionIds
  });
  return res.data;
};

export const addPermissionToRole = async (
  roleId: string,
  permissionId: string,
  req?: IncomingMessage
) => {
  const axios = req ? axiosWithAuth(req) : api;
  const res = await axios.post(`/roles/${roleId}/permissions/${permissionId}`);
  return res.data;
};

export const removePermissionFromRole = async (
  roleId: string,
  permissionId: string,
  req?: IncomingMessage
) => {
  const axios = req ? axiosWithAuth(req) : api;
  const res = await axios.delete(
    `/roles/${roleId}/permissions/${permissionId}`
  );
  return res.data;
};

export interface GetParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

interface RoleResponse {
  success: boolean;
  count: number;
  permissions: IPermission[];
}

export const getAllPermissions = async ({
  page = 1,
  limit = 10,
  startDate,
  endDate
}: GetParams = {}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    // Add date filters to query if they exist
    if (startDate) {
      query.append('startDate', startDate);
    }
    if (endDate) {
      query.append('endDate', endDate);
    }

    const url = `permissions?${query}`;

    const response = await api.get<RoleResponse>(url);
    const permissions = response.data.permissions;

    return {
      permissions: permissions,
      totalCount: response.data.count ?? permissions.length,
      success: response.data.success
    };
  } catch (error) {
    throw error;
  }
};

export const getPermission = async (req?: IncomingMessage) => {
  const axios = axiosWithAuth(req);
  const res = await axios.get(`/permissions`);
  return res.data.permissions;
};

interface RolePermissionResponse {
  success: boolean;
  count: number;
  rolePermissions: IRolePermission[];
}

// ============================
// Role-Permission CRUD Operations
// ============================

// Create a role-permission link
export const createRolePermission = async (
  data: { roleId: string; permissionIds: string[] },
  req?: IncomingMessage
) => {
  const axios = axiosWithAuth(req);

  const res = await axios.post('/role-permissions', {
    roleId: data.roleId,
    permissionIds: data.permissionIds
  });

  return res.data;
};
export const Createassign = async (
  data: { roleId: string; permissionIds: string[] },
  req?: IncomingMessage
) => {
  const axios = axiosWithAuth(req);

  const res = await axios.post('/role-permissions/assign', {
    roleId: data.roleId,
    permissionIds: data.permissionIds
  });

  return res.data;
};

export const updateRolePermissionsService = async (
  data: { roleId: string; permissionIds: string[] },
  req?: IncomingMessage
) => {
  const axios = axiosWithAuth(req);

  const res = await axios.put('/role/permissions/update/assign', {
    roleId: data.roleId,
    permissionIds: data.permissionIds
  });

  return res.data;
};
// Get all role-permissions with pagination & filters (optional)
export const getAllRolePermissions = async ({
  page = 1,
  limit = 10,
  startDate,
  endDate
}: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
} = {}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);

    const url = `role-permissions?${query.toString()}`;

    const response = await api.get<RolePermissionResponse>(url);
    return {
      rolePermissions: response.data.rolePermissions,
      totalCount: response.data.count ?? response.data.rolePermissions.length,
      success: response.data.success
    };
  } catch (error) {
    throw error;
  }
};

// Get a role-permission by ID
export const getRolePermissionById = async (
  id: string,
  req?: IncomingMessage
) => {
  const axios = req ? axiosWithAuth(req) : api;
  const res = await axios.get(`/role-permissions/${id}`);
  return res.data;
};

// Delete a role-permission by ID
export const deleteRolePermission = async (
  id: string,
  req?: IncomingMessage
) => {
  const axios = axiosWithAuth(req);
  const res = await axios.delete(`/role-permissions/${id}`);
  return res.data;
};

// Delete a role-permission by roleId and permissionId relation
export const deleteRolePermissionByRelation = async (
  roleId: string,
  permissionId: string,
  req?: IncomingMessage
) => {
  const axios = axiosWithAuth(req);
  const res = await axios.delete(`/role-permissions/${roleId}/${permissionId}`);
  return res.data;
};

export const updateRolePermission = async (
  id: string,
  data: Partial<IRolePermission>,
  req?: IncomingMessage
) => {
  const axios = axiosWithAuth(req);
  const res = await axios.put(`/role-permissions/${id}`, data);
  return res.data;
};
