import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, Save, User, Upload, Camera } from 'lucide-react';
import { Employee, EmployeeFormData } from '../types/employee';
import { useEmployees } from '../hooks/useEmployees';
import { departments } from '../utils/mockData';
import { toast } from 'sonner@2.0.3';

interface EmployeeFormProps {
  employeeId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const EmployeeForm = ({ employeeId, onBack, onSuccess }: EmployeeFormProps) => {
  const { addEmployee, updateEmployee, getEmployeeById, uploadEmployeePhoto } = useEmployees();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: 0,
    startDate: '',
    status: 'active',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  const isEditing = !!employeeId;

  // Load employee data for editing
  useEffect(() => {
    if (employeeId) {
      const employee = getEmployeeById(employeeId);
      if (employee) {
        setCurrentEmployee(employee);
        setFormData({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          position: employee.position,
          department: employee.department,
          salary: employee.salary,
          startDate: employee.startDate,
          status: employee.status,
          address: employee.address,
          emergencyContact: employee.emergencyContact,
          emergencyPhone: employee.emergencyPhone,
        });
      }
    }
  }, [employeeId, getEmployeeById]);

  const handleInputChange = (field: keyof EmployeeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!formData.position.trim()) {
      toast.error('Position is required');
      return false;
    }
    if (!formData.department) {
      toast.error('Department is required');
      return false;
    }
    if (formData.salary <= 0) {
      toast.error('Salary must be greater than 0');
      return false;
    }
    if (!formData.startDate) {
      toast.error('Start date is required');
      return false;
    }
    return true;
  };

  const handlePhotoUpload = async (file: File) => {
    if (!isEditing || !employeeId) {
      toast.error('Please save the employee first before uploading a photo');
      return;
    }

    try {
      setUploading(true);
      const profilePicture = await uploadEmployeePhoto(employeeId, file);
      setCurrentEmployee(prev => prev ? { ...prev, profilePicture } : null);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      // Error handled in hook
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      if (file.size > 5242880) { // 5MB
        toast.error('File size must be less than 5MB');
        return;
      }

      handlePhotoUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing && employeeId) {
        await updateEmployee(employeeId, formData);
        toast.success('Employee updated successfully');
      } else {
        await addEmployee(formData);
        toast.success('Employee added successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Update employee information' : 'Fill in the details to add a new employee'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Employee Information</span>
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Modify the employee details below' : 'Enter the new employee details below'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Section */}
            {isEditing && (
              <div className="space-y-4">
                <h3 className="font-medium">Profile Photo</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentEmployee?.profilePicture} />
                    <AvatarFallback className="text-lg">
                      {formData.firstName?.[0]}{formData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF or WebP. Max 5MB.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Work Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Enter job position"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', parseInt(e.target.value) || 0)}
                    placeholder="Enter salary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inactive" id="inactive" />
                    <Label htmlFor="inactive">Inactive</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : isEditing ? 'Update Employee' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};