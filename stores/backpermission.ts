export const PERMISSIONS = {
  PERMISSION: {
    VIEW_ALL: {
      name: 'VIEW_ALL_PERMISSIONS',
      description: 'View all permissions'
    },
    DELETE: {
      name: 'DELETE_PERMISSION',
      description: 'Delete permission by ID'
    }
  },

  ROLE: {
    CREATE: { name: 'CREATE_ROLE', description: 'Create new role' },
    VIEW_ALL: { name: 'VIEW_ALL_ROLES', description: 'View all roles' },
    VIEW: { name: 'VIEW_ROLE', description: 'View role by ID' },
    UPDATE: { name: 'UPDATE_ROLE', description: 'Update role' },
    DELETE: { name: 'DELETE_ROLE', description: 'Delete role' }
  },

  ROLE_PERMISSION: {
    CREATE: {
      name: 'CREATE_ROLE_PERMISSION',
      description: 'Create role-permission link'
    },
    ASSIGN: {
      name: 'ASSIGN_ROLE_PERMISSIONS',
      description: 'Assign permissions to role'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_ROLE_PERMISSIONS',
      description: 'View all role-permission relationships'
    },
    DELETE: {
      name: 'DELETE_ROLE_PERMISSION',
      description: 'Delete role-permission by ID'
    }
  },

  COMPANY: {
    CREATE: 'CREATE_COMPANY',
    VIEW: 'VIEW_COMPANY',
    UPDATE: 'UPDATE_COMPANY',
    DELETE: 'DELETE_COMPANY'
  },
  Employee: {
    CREATE: {
      name: 'CREATE_Employee',
      description: 'Register or create new Employee accounts'
    },
    VIEW: {
      name: 'VIEW_Employee',
      description: 'View specific Employee details'
    },
    VIEW_ALL: {
      name: 'VIEW_Employee',
      description: 'View all Employee in the system'
    },
    // VIEW_BY_ROLE: {
    //   name: 'VIEW_USERS_BY_ROLE',
    //   description: 'View users by specific roles (e.g., tenant, employee)',
    // },
    // VIEW_UNCONFIRMED: {
    //   name: 'VIEW_UNCONFIRMED_USERS',
    //   description: 'View users with confirmation false',
    // },
    // VIEW_ASSIGNED_EMPLOYEES: {
    //   name: 'VIEW_ASSIGNED_EMPLOYEES',
    //   description: 'View previously assigned employees',
    // },
    UPDATE: {
      name: 'UPDATE_Employee',
      description: 'Update existing Employee information'
    },
    DELETE: {
      name: 'DELETE_Employee',
      description: 'Delete Employee accounts'
    },
    CHANGE_PASSWORD: {
      name: 'CHANGE_USER_PASSWORD',
      description: 'Change password for user accounts'
    }
  },
  ADDRESS: {
    CREATE: { name: 'CREATE_ADDRESS', description: 'Create new addresses' },
    VIEW: { name: 'VIEW_ADDRESS', description: 'View address details' },
    VIEW_ALL: { name: 'VIEW_ADDRESSES', description: 'View all addresses' },
    VIEW_EMPLOYEE: {
      name: 'VIEW_EMPLOYEE_ADDRESSES',
      description: 'View employee addresses'
    },
    UPDATE: { name: 'UPDATE_ADDRESS', description: 'Update addresses' },
    DELETE: { name: 'DELETE_ADDRESS', description: 'Delete addresses' },
    VIEW_MAIN: {
      name: 'VIEW_MAIN_ADDRESS',
      description: 'View employee main address'
    }
  },
  // Emergency Contact Permissions
  EMERGENCY_CONTACT: {
    CREATE: {
      name: 'CREATE_EMERGENCY_CONTACT',
      description: 'Create new emergency contacts'
    },
    VIEW: {
      name: 'VIEW_EMERGENCY_CONTACT',
      description: 'View emergency contact details'
    },
    // VIEW_ALL: {
    //   name: 'VIEW_EMERGENCY_CONTACTS',
    //   description: 'View all emergency contacts',
    // },
    VIEW_EMPLOYEE: {
      name: 'VIEW_EMPLOYEE_EMERGENCY_CONTACTS',
      description: 'View employee emergency contacts'
    },
    UPDATE: {
      name: 'UPDATE_EMERGENCY_CONTACT',
      description: 'Update emergency contacts'
    },
    DELETE: {
      name: 'DELETE_EMERGENCY_CONTACT',
      description: 'Delete emergency contacts'
    },
    VIEW_PRIMARY: {
      name: 'VIEW_PRIMARY_EMERGENCY_CONTACT',
      description: 'View employee primary emergency contact'
    }
  },
  INTERNAL_POSITION: {
    CREATE: {
      name: 'CREATE_INTERNAL_POSITION',
      description: 'Create new internal position history records'
    },
    VIEW_PAST: {
      name: 'VIEW_ALL_PAST_POSITION',
      description: 'View all internal position history records'
    },
    VIEW_CURRENT: {
      name: 'VIEW__ALL_CURRENT_POSITION',
      description: 'View current position of an employee'
    },
    UPDATE: {
      name: 'UPDATE_INTERNAL_POSITION',
      description: 'Update existing internal position history records'
    },
    DELETE: {
      name: 'DELETE_INTERNAL_POSITION',
      description: 'Delete internal position history records'
    }
  },

  PERFORMANCE_EVALUATION: {
    CREATE: {
      name: 'CREATE_PERFORMANCE_EVALUATION',
      description: 'Create new performance evaluation records'
    },
    VIEW: {
      name: 'VIEW_PERFORMANCE_EVALUATION',
      description: 'View specific performance evaluation details'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_PERFORMANCE_EVALUATIONS',
      description: 'View all performance evaluation records'
    },
    VIEW_EMPLOYEE: {
      name: 'VIEW_EMPLOYEE_PERFORMANCE_EVALUATIONS',
      description: 'View performance evaluations for specific employees'
    },
    VIEW_LATEST: {
      name: 'VIEW_EMPLOYEE_LATEST_PERFORMANCE_EVALUATION',
      description: 'View latest performance evaluation of an employee'
    },
    UPDATE: {
      name: 'UPDATE_PERFORMANCE_EVALUATION',
      description: 'Update existing performance evaluation records'
    },
    DELETE: {
      name: 'DELETE_PERFORMANCE_EVALUATION',
      description: 'Delete performance evaluation records'
    }
  },
  DEPARTMENT: {
    CREATE: {
      name: 'CREATE_DEPARTMENT',
      description: 'Create new departments'
    },
    VIEW_ALL: {
      name: 'VIEW_DEPARTMENTS',
      description: 'View all departments'
    },
    VIEW_OWN: {
      name: 'VIEW_OWN',
      description: 'View a specific user department '
    },
    UPDATE: {
      name: 'UPDATE_DEPARTMENT',
      description: 'Update department details'
    },
    DELETE: {
      name: 'DELETE_DEPARTMENT',
      description: 'Delete a department'
    }
  },
  DEPARTMENT_UNIT: {
    CREATE: {
      name: 'CREATE_DEPARTMENT_UNIT',
      description: 'Create a department unit'
    },
    UPDATE: {
      name: 'UPDATE_DEPARTMENT_UNIT',
      description: 'Update a department unit'
    },
    DELETE: {
      name: 'DELETE_DEPARTMENT_UNIT',
      description: 'Delete a department unit'
    }
  },
  MANAGER_MEMBERSHIP: {
    CREATE_BULK: {
      name: 'CREATE_MANAGER_MEMBERSHIPS_BULK',
      description: 'Create multiple manager memberships'
    }
  },
  // Area Permissions
  AREA: {
    CREATE: { name: 'CREATE_AREA', description: 'Create new areas' },
    VIEW: { name: 'VIEW_AREA', description: 'View area details' },
    VIEW_ALL: { name: 'VIEW_AREAS', description: 'View all areas' },
    UPDATE: { name: 'UPDATE_AREA', description: 'Update areas' },
    DELETE: { name: 'DELETE_AREA', description: 'Delete areas' }
  },
  UNIT: {
    CREATE: { name: 'CREATE_UNIT', description: 'Create new units' },
    VIEW: { name: 'VIEW_UNIT', description: 'View unit details' },
    VIEW_ALL: { name: 'VIEW_UNITS', description: 'View all units' },
    UPDATE: { name: 'UPDATE_UNIT', description: 'Update unit information' },
    DELETE: { name: 'DELETE_UNIT', description: 'Delete unit' }
  },
  UNIT_TYPE: {
    CREATE: { name: 'CREATE_UNIT_TYPE', description: 'Create new unit types' },
    VIEW: { name: 'VIEW_UNIT_TYPE', description: 'View unit type details' },
    VIEW_ALL: { name: 'VIEW_UNIT_TYPES', description: 'View all unit types' },
    UPDATE: { name: 'UPDATE_UNIT_TYPE', description: 'Update unit type' },
    DELETE: { name: 'DELETE_UNIT_TYPE', description: 'Delete unit type' }
  },
  // Attendance Permissions
  ATTENDANCE: {
    CREATE_REPORT: {
      name: 'CREATE_ATTENDANCE_REPORT',
      description: 'Create new attendance reports'
    },
    VIEW_REPORT: {
      name: 'VIEW_ATTENDANCE_REPORT',
      description: 'View attendance report details'
    },
    VIEW_ALL_REPORTS: {
      name: 'VIEW_ALL_ATTENDANCE_REPORTS',
      description: 'View all attendance reports'
    },
    UPDATE_REPORT: {
      name: 'UPDATE_ATTENDANCE_REPORT',
      description: 'Update attendance reports'
    },
    DELETE_REPORT: {
      name: 'DELETE_ATTENDANCE_REPORT',
      description: 'Delete attendance reports'
    },
    VIEW_USER_REPORTS: {
      name: 'VIEW_USER_ATTENDANCE_REPORTS',
      description: 'View user-specific attendance reports'
    }
  },
  Project: {
    CREATE: {
      name: 'CREATE_PROJECT',
      description: 'Create new projects'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_PROJECTS',
      description: 'View all projects with optional filters'
    },
    VIEW_MEMBER: {
      name: 'VIEW_PROJECT_MEMBERS',
      description: 'View all project members'
    },
    UPDATE: {
      name: 'UPDATE_PROJECT',
      description: 'Update existing projects'
    },
    DELETE: {
      name: 'DELETE_PROJECT',
      description: 'Delete projects'
    }
  },
  Task: {
    VIEW_ALL: {
      name: 'VIEW_ALL_TASKS',
      description: 'View all tasks'
    },
    VIEW_BY_CREATOR: {
      name: 'VIEW_TASKS_BY_CREATOR',
      description: 'View tasks created by a specific user'
    },
    DELETE: {
      name: 'DELETE_TASK',
      description: 'Delete a task'
    }
  },
  // Personal Goal Permissions
  COMPANY_GOAL: {
    CREATE_REPORT: {
      name: 'CREATE_COMPANY_GOAL_REPORT',
      description: 'Create new COMPANY goal reports'
    },
    VIEW_REPORT: {
      name: 'VIEW_COMPANY_GOAL_REPORT',
      description: 'View COMPANY goal report details'
    },
    VIEW_ALL_REPORTS: {
      name: 'VIEW_ALL_COMPANY_GOAL_REPORTS',
      description: 'View all COMPANY goal reports'
    },
    UPDATE_REPORT: {
      name: 'UPDATE_COMPANY_GOAL_REPORT',
      description: 'Update COMPANY goal reports'
    },
    DELETE_REPORT: {
      name: 'DELETE_COMPANY_GOAL_REPORT',
      description: 'Delete personal goal reports'
    }
  },
  RECEPTION_LOG: {
    CREATE: {
      name: 'CREATE_RECEPTION_LOG',
      description: 'Create new reception logs'
    },
    VIEW_ALL: {
      name: 'VIEW_RECEPTION_LOGS',
      description: 'View all reception logs'
    },
    UPDATE: {
      name: 'UPDATE_RECEPTION_LOG',
      description: 'Update reception logs'
    },
    DELETE: {
      name: 'DELETE_RECEPTION_LOG',
      description: 'Delete reception logs'
    },
    CHECKOUT: {
      name: 'CHECKOUT_VISITOR',
      description: 'Check out visitors from reception logs'
    }
  },

  FEEDBACK: {
    VIEW_ALL: { name: 'VIEW_ALL_FEEDBACK', description: 'View all feedback' },
    DELETE: { name: 'DELETE_FEEDBACK', description: 'Delete feedback' }
  },
  LEASE: {
    CREATE: { name: 'CREATE_LEASE', description: 'Create a new lease' },
    UPDATE: { name: 'UPDATE_LEASE', description: 'Update lease details' },
    UPDATE_MAIN: {
      name: 'UPDATE_MAIN_LEASE',
      description: 'Update main lease details'
    },
    DELETE: { name: 'DELETE_LEASE', description: 'Delete a lease' },
    VIEW: { name: 'VIEW_LEASE', description: 'View lease by ID' },
    VIEW_ALL: { name: 'VIEW_ALL_LEASES', description: 'View all leases' },
    VIEW_PAID: { name: 'VIEW_PAID_LEASES', description: 'View paid leases' },
    VIEW_UNPAID: {
      name: 'VIEW_UNPAID_LEASES',
      description: 'View unpaid leases'
    },
    VIEW_THIS_MONTH: {
      name: 'VIEW_THIS_MONTH_LEASES',
      description: 'View leases with payments this month'
    },
    VIEW_EXPIRING_SOON: {
      name: 'VIEW_EXPIRING_SOON_LEASES',
      description: 'View leases expiring soon'
    },
    VIEW_BY_TENANT: {
      name: 'VIEW_LEASES_BY_TENANT',
      description: 'View leases for a specific tenant'
    },
    VIEW_PROPERTY_ACTIVE: {
      name: 'VIEW_PROPERTY_ACTIVE_LEASES',
      description: 'View active leases for a property'
    },
    GENERATE_INVOICES: {
      name: 'GENERATE_LEASE_INVOICES',
      description: 'Generate invoices for leases'
    },
    RECORD_PAYMENT: {
      name: 'RECORD_LEASE_PAYMENT',
      description: 'Record lease payment'
    },
    REGISTER_PAYMENT: {
      name: 'REGISTER_PAYMENT_DETAILS',
      description: 'Register payment details for a lease'
    },
    UPCOMING_RENEWALS: {
      name: 'CHECK_UPCOMING_RENEWALS',
      description: 'Check upcoming lease renewals'
    },
    UPCOMING_PAYMENTS: {
      name: 'CHECK_UPCOMING_PAYMENTS',
      description: 'Check upcoming lease payments'
    },
    VIEW_DASHBOARD: {
      name: 'VIEW_PROPERTY_ANALYTICS_DASHBOARD',
      description: 'View property analytics dashboard'
    },

    TERMINATE: {
      name: 'TERMINATE_LEASE',
      description: 'Terminate a lease agreement'
    }
  },
  LEASE_RENEWAL: {
    SEND_REQUEST: {
      name: 'SEND_LEASE_RENEWAL_REQUEST',
      description: 'Send lease renewal request'
    },
    APPROVE: {
      name: 'APPROVE_LEASE_RENEWAL',
      description: 'Approve lease renewal'
    },
    UPDATE: {
      name: 'UPDATE_LEASE_RENEWAL',
      description: 'Update lease renewal'
    },
    RENEW: { name: 'RENEW_LEASE', description: 'Renew a lease' },
    CALCULATE_RENT: {
      name: 'CALCULATE_RENEWAL_RENT',
      description: 'Calculate rent for lease renewal'
    },
    VIEW_PENDING: {
      name: 'VIEW_PENDING_RENEWALS',
      description: 'View pending lease renewals'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_RENEWALS',
      description: 'View all lease renewals'
    },
    VIEW_TENANT_ACCEPTED: {
      name: 'VIEW_TENANT_ACCEPTED_RENEWALS',
      description: 'View tenant-accepted renewals'
    },
    VIEW_ACCEPTED: {
      name: 'VIEW_ACCEPTED_RENEWALS',
      description: 'View accepted lease renewals'
    }
  },

  PAYMENT_SCHEDULE: {
    UPDATE: {
      name: 'UPDATE_PAYMENT_SCHEDULE',
      description: 'Update lease payment schedule'
    }
  },
  SUPPLIER: {
    CREATE: {
      name: 'CREATE_SUPPLIER',
      description: 'Create a new supplier'
    },
    VIEW: {
      name: 'VIEW_SUPPLIER',
      description: 'View a specific supplier'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_SUPPLIERS',
      description: 'View all suppliers'
    },
    UPDATE: {
      name: 'UPDATE_SUPPLIER',
      description: 'Update a supplier'
    },
    DELETE: {
      name: 'DELETE_SUPPLIER',
      description: 'Delete a supplier'
    }
  },
  UNIT_OF_MEASURE: {
    CREATE: {
      name: 'CREATE_UNIT_OF_MEASURE',
      description: 'Create a new unit of measure'
    },
    VIEW: {
      name: 'VIEW_UNIT_OF_MEASURE',
      description: 'View a specific unit of measure'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_UNITS_OF_MEASURE',
      description: 'View all units of measure'
    },
    UPDATE: {
      name: 'UPDATE_UNIT_OF_MEASURE',
      description: 'Update a unit of measure'
    },
    DELETE: {
      name: 'DELETE_UNIT_OF_MEASURE',
      description: 'Delete a unit of measure'
    }
  },

  PRODUCT_UNIT: {
    CREATE: {
      name: 'CREATE_PRODUCT_UNIT',
      description: 'Add a product unit to an inventory item'
    },
    VIEW: {
      name: 'VIEW_PRODUCT_UNIT',
      description: 'View a specific product unit'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_PRODUCT_UNITS',
      description: 'View all product units'
    },
    UPDATE: {
      name: 'UPDATE_PRODUCT_UNIT',
      description: 'Update a product unit'
    },
    DELETE: {
      name: 'DELETE_PRODUCT_UNIT',
      description: 'Delete a product unit'
    }
  },
  INVENTORY_BATCH: {
    VIEW_ALL: {
      name: 'VIEW_ALL_INVENTORY_BATCHES',
      description: 'View all inventory batches'
    },

    UPDATE: {
      name: 'UPDATE_INVENTORY_BATCH',
      description: 'Update inventory batch details'
    },
    DELETE: {
      name: 'DELETE_INVENTORY_BATCH',
      description: 'Delete an inventory batch'
    }
  },
  INVENTORY_CATEGORY: {
    CREATE: {
      name: 'CREATE_INVENTORY_CATEGORY',
      description: 'Create a new inventory category'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_INVENTORY_CATEGORIES',
      description: 'View all inventory categories'
    },
    UPDATE: {
      name: 'UPDATE_INVENTORY_CATEGORY',
      description: 'Update an inventory category'
    },
    DELETE: {
      name: 'DELETE_INVENTORY_CATEGORY',
      description: 'Delete an inventory category'
    }
  },
  INVENTORY_ITEM: {
    CREATE: {
      name: 'CREATE_INVENTORY_ITEM',
      description: 'Create a new inventory item'
    },
    VIEW: {
      name: 'VIEW_INVENTORY_ITEM',
      description: 'View a specific inventory item'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_INVENTORY_ITEMS',
      description: 'View all inventory items'
    },
    UPDATE: {
      name: 'UPDATE_INVENTORY_ITEM',
      description: 'Update an inventory item'
    },
    DELETE: {
      name: 'DELETE_INVENTORY_ITEM',
      description: 'Delete an inventory item'
    }
  },

  INVENTORY_ANALYTICS: {
    VIEW_DASHBOARD: {
      name: 'VIEW_INVENTORY_ANALYTICS_DASHBOARD',
      description: 'View inventory dashboard analytics'
    }
  },
  INVENTORY_LOG: {
    VIEW_ALL: {
      name: 'VIEW_ALL_INVENTORY_LOGS',
      description: 'View all inventory logs'
    }
  },
  STOCK_LEDGER: {
    VIEW_ALL: {
      name: 'VIEW_ALL_STOCK_LEDGERS',
      description: 'View stock ledger data for the last 4 months'
    },
    VIEW_BY_ITEM: {
      name: 'VIEW_STOCK_LEDGER_BY_ITEM',
      description: 'View stock ledger for a specific inventory item'
    }
  },
  INVENTORY_REQUEST: {
    CREATE: {
      name: 'CREATE_INVENTORY_REQUEST',
      description: 'Create a new inventory request'
    },
    VIEW: {
      name: 'VIEW_INVENTORY_REQUEST',
      description: 'View a specific inventory request'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_INVENTORY_REQUESTS',
      description: 'View all inventory requests'
    },
    UPDATE: {
      name: 'UPDATE_INVENTORY_REQUEST',
      description: 'Update an inventory request'
    },
    APPROVE: {
      name: 'APPROVE_INVENTORY_REQUEST',
      description: 'Approve an inventory request'
    },
    DELETE: {
      name: 'DELETE_INVENTORY_REQUEST',
      description: 'Delete an inventory request'
    }
  },
  INVENTORY_STOCK: {
    VIEW_ALL: {
      name: 'VIEW_ALL_INVENTORY_STOCKS',
      description: 'View all inventory stocks'
    },
    VIEW_ITEM_STOCKS: {
      name: 'VIEW_ITEM_STOCKS',
      description: 'View all item-wise inventory stocks'
    }
  },
  MANUAL_STOCK_ENTRY_BATCH: {
    CREATE: {
      name: 'CREATE_MANUAL_STOCK_ENTRY_BATCH',
      description: 'Create a new manual stock entry batch'
    },
    VIEW: {
      name: 'VIEW_MANUAL_STOCK_ENTRY_BATCH',
      description: 'View a specific manual stock entry batch'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_MANUAL_STOCK_ENTRY_BATCHES',
      description: 'View all manual stock entry batches'
    },
    UPDATE: {
      name: 'UPDATE_MANUAL_STOCK_ENTRY_BATCH',
      description: 'Update a manual stock entry batch'
    },
    DELETE: {
      name: 'DELETE_MANUAL_STOCK_ENTRY_BATCH',
      description: 'Delete a manual stock entry batch'
    },
    APPROVE: {
      name: 'APPROVE_MANUAL_STOCK_ENTRY_BATCH',
      description: 'Approve a manual stock entry batch'
    }
  },
  // part three
  BILL: {
    CREATE: {
      name: 'CREATE_BILL',
      description: 'Create a new bill'
    },
    VIEW: {
      name: 'VIEW_BILL',
      description: 'View a specific bill by ID'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_BILLS',
      description: 'View all bills with expenses'
    },
    UPDATE: {
      name: 'UPDATE_BILL',
      description: 'Update an existing bill'
    },
    DELETE: {
      name: 'DELETE_BILL',
      description: 'Delete a bill by ID'
    }
  },
  CHECK_ENTRANCE: {
    CREATE: {
      name: 'CREATE_CHECK_ENTRANCE',
      description: 'Create a new check entrance'
    },
    VIEW: {
      name: 'VIEW_CHECK_ENTRANCE',
      description: 'View a specific check entrance by ID'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_CHECK_ENTRANCES',
      description: 'View all check entrances'
    },
    UPDATE: {
      name: 'UPDATE_CHECK_ENTRANCE',
      description: 'Update a check entrance'
    }
  },
  DISCOUNT: {
    CREATE: {
      name: 'CREATE_DISCOUNT',
      description: 'Create a new discount'
    },
    VIEW: {
      name: 'VIEW_DISCOUNT',
      description: 'View a specific discount by ID'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_DISCOUNTS',
      description: 'View all discounts'
    },
    UPDATE: {
      name: 'UPDATE_DISCOUNT',
      description: 'Update an existing discount'
    },
    DELETE: {
      name: 'DELETE_DISCOUNT',
      description: 'Delete a discount by ID'
    },
    TOGGLE_STATUS: {
      name: 'TOGGLE_DISCOUNT_STATUS',
      description: 'Enable or disable a discount status'
    }
  },
  CHART_OF_ACCOUNT: {
    CREATE: {
      name: 'CREATE_CHART_OF_ACCOUNT',
      description: 'Create a new chart of account'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_CHART_OF_ACCOUNTS',
      description: 'View all chart of accounts'
    },
    UPDATE: {
      name: 'UPDATE_CHART_OF_ACCOUNT',
      description: 'Update an existing chart of account'
    },
    DELETE: {
      name: 'DELETE_CHART_OF_ACCOUNT',
      description: 'Delete a chart of account by ID'
    },
    VIEW_STATEMENT: {
      name: 'VIEW_CHART_OF_ACCOUNT_STATEMENT',
      description: 'View the statement of a chart of account'
    },
    VIEW_PROFIT_AND_LOSS_REPORT: {
      name: 'VIEW_PROFIT_AND_LOSS_REPORT',
      description: 'View the Profit and Loss report'
    },
    VIEW_BALANCE_SHEET_REPORT: {
      name: 'VIEW_BALANCE_SHEET_REPORT',
      description: 'View the Balance Sheet report'
    }
  },

  INVOICE: {
    CREATE: {
      name: 'CREATE_SERVICE_INVOICE',
      description: 'Create a new invoice'
    },
    CREATE_SALES: {
      name: 'CREATE_SALES_INVOICE',
      description: 'Create a new sales invoice'
    },
    APPLY_DISCOUNT_SERVICE: {
      name: 'APPLY_DISCOUNT_TO_SERVICE_INVOICE',
      description: 'Apply a discount to an invoice'
    },
    APPROVE_SERVICE: {
      name: 'APPROVE_SERVICE_INVOICE',
      description: 'Approve a service invoice'
    },
    APPROVE_SALES: {
      name: 'APPROVE_SALES_INVOICE',
      description: 'Approve a sales invoice'
    },
    VIEW: {
      name: 'VIEW_SERVICE_INVOICE',
      description: 'View a specific invoice by ID'
    },
    VIEW_ALL_Paid: {
      name: 'VIEW_ALL_SERVICE_Paid_INVOICES',
      description: 'View all invoices'
    },
    VIEW_PENDING: {
      name: 'VIEW_PENDING_SERVICE_INVOICES',
      description: 'View all pending service invoices'
    },
    UPDATE: {
      name: 'UPDATE_SERVICE_INVOICE',
      description: 'Update an invoice'
    },
    UPDATE_INITIAL: {
      name: 'UPDATE_INITIAL_SERVICE_INVOICE',
      description: 'Update an initial invoice'
    },
    UPDATE_SALES: {
      name: 'UPDATE_SALES_INVOICE',
      description: 'Update a sales invoice'
    },
    DELETE: {
      name: 'DELETE_SERVICE_INVOICE',
      description: 'Delete an invoice by ID'
    }
  },
  JOURNAL: {
    CREATE: {
      name: 'CREATE_JOURNAL',
      description: 'Create a new journal entry'
    },
    VIEW: {
      name: 'VIEW_JOURNAL',
      description: 'View a specific journal by ID'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_JOURNALS',
      description: 'View all journal entries'
    },
    UPDATE: {
      name: 'UPDATE_JOURNAL',
      description: 'Update a journal entry'
    },
    DELETE: {
      name: 'DELETE_JOURNAL',
      description: 'Delete a journal entry by ID'
    },
    VIEW_STATEMENT: {
      name: 'VIEW_JOURNAL_STATEMENT',
      description: 'View the journal statement'
    }
  },
  MAINTENANCE: {
    CREATE: {
      name: 'CREATE_MAINTENANCE_REQUEST',
      description: 'Create a new maintenance request'
    },
    VIEW: {
      name: 'VIEW_MAINTENANCE_REQUEST',
      description: 'View a specific maintenance request by ID'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_MAINTENANCE_REQUESTS',
      description: 'View all maintenance requests'
    },
    VIEW_RENTER: {
      name: 'VIEW_RENTER_MAINTENANCE_REQUESTS',
      description: 'View all maintenance requests for the renter'
    },
    VIEW_ASSIGNED: {
      name: 'VIEW_ASSIGNED_MAINTENANCE_REQUESTS',
      description: 'View maintenance requests assigned to you'
    },
    UPDATE: {
      name: 'UPDATE_MAINTENANCE_REQUEST',
      description: 'Update a maintenance request'
    },
    UPDATE_RENTER: {
      name: 'UPDATE_RENTER_MAINTENANCE_REQUEST',
      description: 'Update a maintenance request as renter'
    },
    CANCEL: {
      name: 'CANCEL_MAINTENANCE_REQUEST',
      description: 'Cancel a maintenance request'
    },
    DELETE: {
      name: 'DELETE_MAINTENANCE_REQUEST',
      description: 'Delete a maintenance request by ID'
    }
  },
  PAYROLL: {
    CREATE: {
      name: 'CREATE_PAYROLL',
      description: 'Create a new payroll record'
    },
    VIEW: {
      name: 'VIEW_PAYROLL',
      description: 'View a specific payroll record by ID'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_PAYROLLS',
      description: 'View all payroll records'
    },
    UPDATE: {
      name: 'UPDATE_PAYROLL',
      description: 'Update an existing payroll record'
    },
    DELETE: {
      name: 'DELETE_PAYROLL',
      description: 'Delete a payroll record by ID'
    },
    PROCESS_PAYMENTS: {
      name: 'PROCESS_PAYROLL_PAYMENTS',
      description: 'Process payroll payments'
    },
    GENERATE_FROM_PAST: {
      name: 'GENERATE_PAYROLL_FROM_PAST',
      description: 'Generate payroll from past records'
    }
  },
  PURCHASE_ORDER: {
    CREATE: {
      name: 'CREATE_PURCHASE_ORDER',
      description: 'Create a new purchase order'
    },
    VIEW: {
      name: 'VIEW_PURCHASE_ORDER',
      description: 'View a specific purchase order by ID'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_PURCHASE_ORDERS',
      description: 'View all purchase orders'
    },
    UPDATE: {
      name: 'UPDATE_PURCHASE_ORDER',
      description: 'Update an existing purchase order'
    },
    UPDATE_PAYMENT: {
      name: 'UPDATE_PURCHASE_ORDER_PAYMENT',
      description: 'Update payment information for a received purchase order'
    },
    RECEIVE: {
      name: 'RECEIVE_PURCHASE_ORDER',
      description: 'Mark a purchase order as received'
    },
    DELETE: {
      name: 'DELETE_PURCHASE_ORDER',
      description: 'Delete a purchase order by ID'
    }
  },
  REAL_ESTATE_ANALYTICS: {
    VIEW_DASHBOARD: {
      name: 'VIEW_PROPERTY_DASHBOARD',
      description: 'View the comprehensive property analytics dashboard'
    }
  },
  SALES: {
    VIEW_Paid_SALES_INVOICES: {
      name: 'VIEW_Paid_SALES_INVOICES',
      description: 'View all sales invoices'
    },
    VIEW_PENDING_SALES_INVOICES: {
      name: 'VIEW_PENDING_SALES_INVOICES',
      description: 'View all pending sales invoices'
    },
    SEARCH_INVOICES: {
      name: 'SEARCH_INVOICES',
      description: 'Search invoices'
    },
    REPORT_INVOICES: {
      name: 'REPORT_INVOICES',
      description: 'report invoices'
    },
    VIEW_USER_INVOICES: {
      name: 'VIEW_USER_INVOICES',
      description: 'View invoices of a specific user'
    },
    VIEW_SALES_INVOICE: {
      name: 'VIEW_SALES_INVOICE',
      description: 'View a specific sales invoice by ID'
    },
    UPDATE_SALES_INVOICE_PAYMENT: {
      name: 'UPDATE_SALES_INVOICE_PAYMENT',
      description: 'Update payment of an initial sales invoice'
    },
    DELETE_SALES_INVOICE: {
      name: 'DELETE_SALES_INVOICE',
      description: 'Delete a sales invoice by ID'
    },

    VIEW_Paid_RENTAL_INVOICES: {
      name: 'VIEW_Paid_RENTAL_INVOICES',
      description: 'View all rental invoices'
    },
    VIEW_PENDING_RENTAL_INVOICES: {
      name: 'VIEW_PENDING_RENTAL_INVOICES',
      description: 'View all pending rental invoices'
    },
    VIEW_RENTAL_INVOICE: {
      name: 'VIEW_RENTAL_INVOICE',
      description: 'View a specific rental invoice by ID'
    },
    VIEW_RENTAL_INVOICE_BY_PAYMENT_SCHEDULE: {
      name: 'VIEW_RENTAL_INVOICE_BY_PAYMENT_SCHEDULE',
      description: 'View rental invoice by payment schedule ID'
    },
    UPDATE_RENTAL_INVOICE_PAYMENT: {
      name: 'UPDATE_RENTAL_INVOICE_PAYMENT',
      description: 'Update payment of a rental invoice'
    },
    DELETE_RENTAL_INVOICE: {
      name: 'DELETE_RENTAL_INVOICE',
      description: 'Delete a rental invoice by ID'
    }
  },
  SERVICE: {
    CREATE: {
      name: 'CREATE_SERVICE',
      description: 'Create a new service'
    },
    VIEW: {
      name: 'VIEW_SERVICE',
      description: 'View a specific service by ID'
    },
    VIEW_ALL: {
      name: 'VIEW_ALL_SERVICES',
      description: 'View all services'
    },
    UPDATE: {
      name: 'UPDATE_SERVICE',
      description: 'Update an existing service'
    },
    DELETE: {
      name: 'DELETE_SERVICE',
      description: 'Delete a service by ID'
    }
  }
};
