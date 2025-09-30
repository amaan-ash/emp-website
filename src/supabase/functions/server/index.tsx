import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Logger middleware
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Create storage buckets on startup
const initializeStorage = async () => {
  try {
    const bucketName = 'make-61139265-employee-photos';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Initialize storage on startup and create demo user
const initializeApp = async () => {
  await initializeStorage();
  
  // Create demo user if not exists
  try {
    const existingUser = await kv.get('user:demo');
    if (!existingUser) {
      console.log('Creating demo user...');
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'admin@company.com',
        password: 'demo123456',
        user_metadata: { 
          firstName: 'Admin', 
          lastName: 'User',
          role: 'admin'
        },
        email_confirm: true
      });

      if (error) {
        console.error('Error creating demo user:', error);
        // Try to find if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === 'admin@company.com');
        if (existingUser) {
          console.log('Demo user already exists in Supabase, creating profile...');
          const userProfile = {
            id: existingUser.id,
            email: existingUser.email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            createdAt: new Date().toISOString(),
            isActive: true
          };
          
          await kv.set(`user:${existingUser.id}`, userProfile);
          await kv.set('user:demo', userProfile);
          console.log('Demo user profile created from existing user');
        }
      } else if (data.user) {
        const userProfile = {
          id: data.user.id,
          email: data.user.email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          isActive: true
        };
        
        await kv.set(`user:${data.user.id}`, userProfile);
        await kv.set('user:demo', userProfile);
        console.log('Demo user created successfully');

        // Create some demo employees
        const demoEmployees = [
          {
            id: crypto.randomUUID(),
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            phone: '(555) 123-4567',
            position: 'Software Engineer',
            department: 'Engineering',
            salary: 75000,
            startDate: '2023-01-15',
            status: 'active',
            address: '123 Main St, Anytown, USA',
            emergencyContact: 'Jane Doe',
            emergencyPhone: '(555) 987-6543',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: data.user.id
          },
          {
            id: crypto.randomUUID(),
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@company.com',
            phone: '(555) 234-5678',
            position: 'Marketing Manager',
            department: 'Marketing',
            salary: 65000,
            startDate: '2023-02-01',
            status: 'active',
            address: '456 Oak Ave, Somewhere, USA',
            emergencyContact: 'Mike Johnson',
            emergencyPhone: '(555) 876-5432',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: data.user.id
          },
          {
            id: crypto.randomUUID(),
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.chen@company.com',
            phone: '(555) 345-6789',
            position: 'HR Specialist',
            department: 'Human Resources',
            salary: 58000,
            startDate: '2023-03-10',
            status: 'active',
            address: '789 Pine St, Elsewhere, USA',
            emergencyContact: 'Lisa Chen',
            emergencyPhone: '(555) 765-4321',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: data.user.id
          }
        ];

        for (const employee of demoEmployees) {
          await kv.set(`employee:${employee.id}`, employee);
        }
        console.log('Demo employees created successfully');
      }
    }
  } catch (error) {
    console.error('Error creating demo user:', error);
  }
};

initializeApp();

// Authentication middleware
const requireAuth = async (c: any, next: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Missing authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    c.set('userId', user.id);
    c.set('userEmail', user.email);
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

// Health check
app.get('/make-server-61139265/health', async (c) => {
  try {
    const demoUser = await kv.get('user:demo');
    return c.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      demoUserExists: !!demoUser,
      supabaseConnected: !!supabase
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: error.message 
    }, 500);
  }
});

// Auth endpoints
app.post('/make-server-61139265/auth/signup', async (c) => {
  try {
    const { email, password, firstName, lastName } = await c.req.json();
    
    if (!email || !password || !firstName || !lastName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        firstName, 
        lastName,
        role: 'employee' // Default role
      },
      email_confirm: true // Auto-confirm for demo
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile in KV store
    const userProfile = {
      id: data.user.id,
      email: data.user.email,
      firstName,
      lastName,
      role: 'employee',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    await kv.set(`user:${data.user.id}`, userProfile);

    return c.json({ 
      message: 'User created successfully', 
      userId: data.user.id 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

app.post('/make-server-61139265/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    console.log(`Attempting signin for email: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase signin error:', error);
      
      // If user doesn't exist, try to create them (fallback for demo)
      if (error.message.includes('Invalid login credentials') && email === 'admin@company.com') {
        console.log('Demo user not found, attempting to create...');
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: 'admin@company.com',
          password: 'demo123456',
          user_metadata: { 
            firstName: 'Admin', 
            lastName: 'User',
            role: 'admin'
          },
          email_confirm: true
        });

        if (!createError && createData.user) {
          // Create user profile
          const userProfile = {
            id: createData.user.id,
            email: createData.user.email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            createdAt: new Date().toISOString(),
            isActive: true
          };
          
          await kv.set(`user:${createData.user.id}`, userProfile);
          await kv.set('user:demo', userProfile);
          
          // Now try to sign in again
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (!retryError && retryData.session) {
            return c.json({
              accessToken: retryData.session.access_token,
              user: {
                id: retryData.user.id,
                email: retryData.user.email,
                ...userProfile
              }
            });
          }
        }
      }
      
      return c.json({ error: error.message }, 401);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${data.user.id}`);
    
    // If no profile exists, create one from user metadata
    if (!userProfile && data.user.user_metadata) {
      const newProfile = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata.firstName || 'User',
        lastName: data.user.user_metadata.lastName || 'User',
        role: data.user.user_metadata.role || 'employee',
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      await kv.set(`user:${data.user.id}`, newProfile);
      
      return c.json({
        accessToken: data.session.access_token,
        user: newProfile
      });
    }

    return c.json({
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...userProfile
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

// Employee CRUD endpoints
app.get('/make-server-61139265/employees', requireAuth, async (c) => {
  try {
    const employeeKeys = await kv.getByPrefix('employee:');
    const employees = employeeKeys
      .map(item => item.value)
      .filter(emp => emp != null) // Filter out null values
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    return c.json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return c.json({ error: 'Failed to fetch employees' }, 500);
  }
});

app.get('/make-server-61139265/employees/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const employee = await kv.get(`employee:${id}`);
    
    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404);
    }
    
    return c.json({ employee });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return c.json({ error: 'Failed to fetch employee' }, 500);
  }
});

app.post('/make-server-61139265/employees', requireAuth, async (c) => {
  try {
    const employeeData = await c.req.json();
    const userId = c.get('userId');
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'position', 'department'];
    for (const field of requiredFields) {
      if (!employeeData[field]) {
        return c.json({ error: `${field} is required` }, 400);
      }
    }

    // Check if email already exists
    const existingEmployees = await kv.getByPrefix('employee:');
    const emailExists = existingEmployees.some(emp => 
      emp.value.email.toLowerCase() === employeeData.email.toLowerCase()
    );
    
    if (emailExists) {
      return c.json({ error: 'Employee with this email already exists' }, 400);
    }

    const employeeId = crypto.randomUUID();
    const employee = {
      id: employeeId,
      ...employeeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      status: employeeData.status || 'active',
      profilePicture: null
    };

    await kv.set(`employee:${employeeId}`, employee);

    // Log audit trail
    const auditLog = {
      id: crypto.randomUUID(),
      action: 'CREATE_EMPLOYEE',
      entityType: 'employee',
      entityId: employeeId,
      userId,
      timestamp: new Date().toISOString(),
      details: { employeeName: `${employee.firstName} ${employee.lastName}` }
    };
    await kv.set(`audit:${auditLog.id}`, auditLog);

    return c.json({ employee }, 201);
  } catch (error) {
    console.error('Error creating employee:', error);
    return c.json({ error: 'Failed to create employee' }, 500);
  }
});

app.put('/make-server-61139265/employees/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const userId = c.get('userId');
    
    const existingEmployee = await kv.get(`employee:${id}`);
    if (!existingEmployee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    // Check if email is being changed and if it conflicts
    if (updates.email && updates.email !== existingEmployee.email) {
      const allEmployees = await kv.getByPrefix('employee:');
      const emailExists = allEmployees.some(emp => 
        emp.value.id !== id && 
        emp.value.email.toLowerCase() === updates.email.toLowerCase()
      );
      
      if (emailExists) {
        return c.json({ error: 'Employee with this email already exists' }, 400);
      }
    }

    const updatedEmployee = {
      ...existingEmployee,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await kv.set(`employee:${id}`, updatedEmployee);

    // Log audit trail
    const auditLog = {
      id: crypto.randomUUID(),
      action: 'UPDATE_EMPLOYEE',
      entityType: 'employee',
      entityId: id,
      userId,
      timestamp: new Date().toISOString(),
      details: { 
        employeeName: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
        changes: Object.keys(updates)
      }
    };
    await kv.set(`audit:${auditLog.id}`, auditLog);

    return c.json({ employee: updatedEmployee });
  } catch (error) {
    console.error('Error updating employee:', error);
    return c.json({ error: 'Failed to update employee' }, 500);
  }
});

app.delete('/make-server-61139265/employees/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.get('userId');
    
    const employee = await kv.get(`employee:${id}`);
    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    await kv.del(`employee:${id}`);

    // Log audit trail
    const auditLog = {
      id: crypto.randomUUID(),
      action: 'DELETE_EMPLOYEE',
      entityType: 'employee',
      entityId: id,
      userId,
      timestamp: new Date().toISOString(),
      details: { employeeName: `${employee.firstName} ${employee.lastName}` }
    };
    await kv.set(`audit:${auditLog.id}`, auditLog);

    return c.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return c.json({ error: 'Failed to delete employee' }, 500);
  }
});

// File upload endpoint
app.post('/make-server-61139265/employees/:id/photo', requireAuth, async (c) => {
  try {
    const employeeId = c.req.param('id');
    const userId = c.get('userId');
    
    const employee = await kv.get(`employee:${employeeId}`);
    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    const formData = await c.req.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' }, 400);
    }

    if (file.size > 5242880) { // 5MB
      return c.json({ error: 'File size too large. Maximum 5MB allowed' }, 400);
    }

    const bucketName = 'make-61139265-employee-photos';
    const fileName = `${employeeId}-${Date.now()}.${file.name.split('.').pop()}`;
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Get signed URL
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 365 * 24 * 60 * 60); // 1 year

    // Update employee record
    const updatedEmployee = {
      ...employee,
      profilePicture: signedUrlData?.signedUrl || null,
      profilePictureFileName: fileName,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };

    await kv.set(`employee:${employeeId}`, updatedEmployee);

    return c.json({ 
      message: 'Photo uploaded successfully',
      profilePicture: signedUrlData?.signedUrl 
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return c.json({ error: 'Failed to upload photo' }, 500);
  }
});

// Statistics endpoint
app.get('/make-server-61139265/dashboard/stats', requireAuth, async (c) => {
  try {
    const employees = await kv.getByPrefix('employee:');
    const employeeData = employees.map(item => item.value);
    
    const total = employeeData.length;
    const active = employeeData.filter(emp => emp.status === 'active').length;
    const inactive = employeeData.filter(emp => emp.status === 'inactive').length;
    
    const departmentCounts = employeeData.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageSalary = employeeData.length > 0 
      ? employeeData.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employeeData.length 
      : 0;

    // Recent activity
    const auditLogs = await kv.getByPrefix('audit:');
    const recentActivity = auditLogs
      .map(item => item.value)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return c.json({
      stats: {
        total,
        active,
        inactive,
        departmentCounts,
        averageSalary
      },
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500);
  }
});

// Bulk operations
app.post('/make-server-61139265/employees/bulk-update', requireAuth, async (c) => {
  try {
    const { employeeIds, updates } = await c.req.json();
    const userId = c.get('userId');
    
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return c.json({ error: 'Employee IDs array is required' }, 400);
    }

    const results = [];
    for (const id of employeeIds) {
      const employee = await kv.get(`employee:${id}`);
      if (employee) {
        const updatedEmployee = {
          ...employee,
          ...updates,
          updatedAt: new Date().toISOString(),
          updatedBy: userId
        };
        await kv.set(`employee:${id}`, updatedEmployee);
        results.push({ id, success: true });

        // Log audit trail
        const auditLog = {
          id: crypto.randomUUID(),
          action: 'BULK_UPDATE_EMPLOYEE',
          entityType: 'employee',
          entityId: id,
          userId,
          timestamp: new Date().toISOString(),
          details: { 
            employeeName: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
            changes: Object.keys(updates)
          }
        };
        await kv.set(`audit:${auditLog.id}`, auditLog);
      } else {
        results.push({ id, success: false, error: 'Employee not found' });
      }
    }

    return c.json({ results, totalProcessed: results.length });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return c.json({ error: 'Failed to perform bulk update' }, 500);
  }
});

// Export employees
app.get('/make-server-61139265/employees/export', requireAuth, async (c) => {
  try {
    const format = c.req.query('format') || 'csv';
    const employees = await kv.getByPrefix('employee:');
    const employeeData = employees.map(item => item.value);

    if (format === 'csv') {
      const headers = [
        'ID', 'First Name', 'Last Name', 'Email', 'Phone', 
        'Position', 'Department', 'Salary', 'Start Date', 
        'Status', 'Address', 'Emergency Contact', 'Emergency Phone'
      ];
      
      const csvContent = [
        headers.join(','),
        ...employeeData.map(emp => [
          emp.id,
          emp.firstName,
          emp.lastName,
          emp.email,
          emp.phone || '',
          emp.position,
          emp.department,
          emp.salary || 0,
          emp.startDate || '',
          emp.status,
          emp.address || '',
          emp.emergencyContact || '',
          emp.emergencyPhone || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      c.header('Content-Type', 'text/csv');
      c.header('Content-Disposition', `attachment; filename="employees-${new Date().toISOString().split('T')[0]}.csv"`);
      return c.text(csvContent);
    } else {
      return c.json({ employees: employeeData });
    }
  } catch (error) {
    console.error('Error exporting employees:', error);
    return c.json({ error: 'Failed to export employees' }, 500);
  }
});

// Debug endpoint to check users and system status
app.get('/make-server-61139265/debug/status', async (c) => {
  try {
    const { data: users } = await supabase.auth.admin.listUsers();
    const kvUsers = await kv.getByPrefix('user:');
    const demoUser = await kv.get('user:demo');
    
    return c.json({
      supabaseConnected: true,
      supabaseUsers: users?.users?.length || 0,
      kvUsers: kvUsers.length,
      demoUserInKV: !!demoUser,
      adminUserInSupabase: users?.users?.some(u => u.email === 'admin@company.com') || false,
      environment: {
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return c.json({ 
      error: error.message,
      supabaseConnected: false
    }, 500);
  }
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Start server
Deno.serve(app.fetch);