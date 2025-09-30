import { useState } from 'react';
import { Search, Filter, Edit, Trash2, Eye, Plus, Download, Users2, CheckSquare, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useEmployees } from '../hooks/useEmployees';
import { Employee } from '../types/employee';
import { departments, getDepartmentColor } from '../utils/mockData';
import { toast } from 'sonner@2.0.3';

interface EmployeeListProps {
  onAddEmployee: () => void;
  onEditEmployee: (id: string) => void;
  onViewEmployee: (id: string) => void;
}

export const EmployeeList = ({ onAddEmployee, onEditEmployee, onViewEmployee }: EmployeeListProps) => {
  const { employees, deleteEmployee, bulkUpdateEmployees, exportEmployees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete'>('activate');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleDeleteConfirm = async () => {
    if (deleteEmployeeId) {
      try {
        await deleteEmployee(deleteEmployeeId);
        setDeleteEmployeeId(null);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleBulkAction = async () => {
    if (selectedEmployees.length === 0) return;

    try {
      switch (bulkAction) {
        case 'activate':
          await bulkUpdateEmployees(selectedEmployees, { status: 'active' });
          break;
        case 'deactivate':
          await bulkUpdateEmployees(selectedEmployees, { status: 'inactive' });
          break;
        case 'delete':
          for (const id of selectedEmployees) {
            await deleteEmployee(id);
          }
          toast.success(`Deleted ${selectedEmployees.length} employees`);
          break;
      }
      setSelectedEmployees([]);
      setShowBulkDialog(false);
    } catch (error) {
      // Error handled in hooks
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const exportToCSV = async () => {
    try {
      await exportEmployees('csv');
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2>Employee Directory</h2>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their information
          </p>
        </div>
        <div className="flex space-x-2">
          {selectedEmployees.length > 0 && (
            <Button 
              onClick={() => setShowBulkDialog(true)} 
              variant="outline" 
              size="sm"
            >
              <Users2 className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedEmployees.length})
            </Button>
          )}
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onAddEmployee}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Employees ({filteredEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' 
                          ? 'No employees match your search criteria'
                          : 'No employees found'
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className={selectedEmployees.includes(employee.id) ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.profilePicture} />
                            <AvatarFallback>
                              {employee.firstName?.[0]}{employee.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {employee.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{employee.email}</div>
                          <div className="text-sm text-muted-foreground">{employee.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getDepartmentColor(employee.department) }}
                          />
                          <span>{employee.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>${employee.salary?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={employee.status === 'active' ? 'default' : 'secondary'}
                          className={employee.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewEmployee(employee.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditEmployee(employee.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteEmployeeId(employee.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEmployeeId} onOpenChange={() => setDeleteEmployeeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform actions on {selectedEmployees.length} selected employee{selectedEmployees.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Select action:</p>
              <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">
                    <div className="flex items-center">
                      <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                      Activate Employees
                    </div>
                  </SelectItem>
                  <SelectItem value="deactivate">
                    <div className="flex items-center">
                      <X className="h-4 w-4 mr-2 text-orange-600" />
                      Deactivate Employees
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center">
                      <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                      Delete Employees
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAction}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
            >
              {bulkAction === 'activate' && 'Activate'}
              {bulkAction === 'deactivate' && 'Deactivate'}
              {bulkAction === 'delete' && 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};