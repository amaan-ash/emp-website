import { useState, useEffect, useCallback } from 'react';
import { Employee, EmployeeFormData } from '../types/employee';
import { apiClient } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEmployees();
      // Filter out any null or undefined employees
      const validEmployees = (response.employees || []).filter(emp => emp != null);
      setEmployees(validEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
      // Set empty array on error to prevent null reference issues
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await apiClient.getDashboardStats();
      setDashboardStats(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchDashboardStats();
  }, [fetchEmployees, fetchDashboardStats]);

  const addEmployee = async (employeeData: EmployeeFormData): Promise<Employee> => {
    try {
      const response = await apiClient.createEmployee(employeeData);
      setEmployees(prev => [response.employee, ...prev]);
      await fetchDashboardStats(); // Refresh stats
      return response.employee;
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<EmployeeFormData>) => {
    try {
      const response = await apiClient.updateEmployee(id, updates);
      setEmployees(prev => 
        prev.map(emp => emp.id === id ? response.employee : emp)
      );
      await fetchDashboardStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await apiClient.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      await fetchDashboardStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
      throw error;
    }
  };

  const uploadEmployeePhoto = async (id: string, file: File) => {
    try {
      const response = await apiClient.uploadEmployeePhoto(id, file);
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === id ? { ...emp, profilePicture: response.profilePicture } : emp
        )
      );
      return response.profilePicture;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      throw error;
    }
  };

  const bulkUpdateEmployees = async (employeeIds: string[], updates: Partial<EmployeeFormData>) => {
    try {
      await apiClient.bulkUpdateEmployees(employeeIds, updates);
      await fetchEmployees(); // Refresh all employees
      await fetchDashboardStats(); // Refresh stats
      toast.success(`Updated ${employeeIds.length} employees successfully`);
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast.error('Failed to update employees');
      throw error;
    }
  };

  const exportEmployees = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const data = await apiClient.exportEmployees(format);
      
      if (format === 'csv' && typeof data === 'string') {
        // Create and download CSV file
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Employee list exported successfully');
      } else {
        return data;
      }
    } catch (error) {
      console.error('Error exporting employees:', error);
      toast.error('Failed to export employees');
      throw error;
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp != null && emp.id === id);
  };

  const getEmployeeStats = () => {
    if (dashboardStats?.stats) {
      return dashboardStats.stats;
    }

    // Filter out null/undefined employees first
    const validEmployees = employees.filter(emp => emp != null);

    // Fallback to client-side calculation if stats not available
    const total = validEmployees.length;
    const active = validEmployees.filter(emp => emp.status === 'active').length;
    const inactive = validEmployees.filter(emp => emp.status === 'inactive').length;
    
    const departmentCounts = validEmployees.reduce((acc, emp) => {
      if (emp.department) {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const averageSalary = validEmployees.length > 0 
      ? validEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / validEmployees.length 
      : 0;

    return {
      total,
      active,
      inactive,
      departmentCounts,
      averageSalary
    };
  };

  const getRecentActivity = () => {
    return dashboardStats?.recentActivity || [];
  };

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    uploadEmployeePhoto,
    bulkUpdateEmployees,
    exportEmployees,
    getEmployeeById,
    getEmployeeStats,
    getRecentActivity,
    refreshEmployees: fetchEmployees,
    refreshStats: fetchDashboardStats,
  };
};