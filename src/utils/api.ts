import { projectId, publicAnonKey } from './supabase/info';
import { Employee, EmployeeFormData } from '../types/employee';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-61139265`;

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth methods
  async signup(data: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
  }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signin(email: string, password: string) {
    try {
      const response = await this.request<{ accessToken: string; user: any }>('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      this.setAccessToken(response.accessToken);
      return response;
    } catch (error) {
      console.error('API signin error:', error);
      throw error;
    }
  }

  // Employee methods
  async getEmployees(): Promise<{ employees: Employee[] }> {
    return this.request('/employees');
  }

  async getEmployee(id: string): Promise<{ employee: Employee }> {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(data: EmployeeFormData): Promise<{ employee: Employee }> {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: string, data: Partial<EmployeeFormData>): Promise<{ employee: Employee }> {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: string): Promise<{ message: string }> {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadEmployeePhoto(id: string, file: File): Promise<{ profilePicture: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    const response = await fetch(`${API_BASE}/employees/${id}/photo`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Bulk operations
  async bulkUpdateEmployees(employeeIds: string[], updates: Partial<EmployeeFormData>) {
    return this.request('/employees/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ employeeIds, updates }),
    });
  }

  // Export
  async exportEmployees(format: 'csv' | 'json' = 'csv'): Promise<string | { employees: Employee[] }> {
    const response = await fetch(`${API_BASE}/employees/export?format=${format}`, {
      headers: {
        'Authorization': this.accessToken ? `Bearer ${this.accessToken}` : `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (format === 'csv') {
      return response.text();
    } else {
      return response.json();
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.request('/health');
      console.log('Backend health check:', response);
      return response;
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw error;
    }
  }

  // Debug status
  async debugStatus() {
    try {
      const response = await this.request('/debug/status');
      console.log('Backend debug status:', response);
      return response;
    } catch (error) {
      console.error('Backend debug failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();