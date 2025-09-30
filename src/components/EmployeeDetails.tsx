import { ArrowLeft, Edit, Mail, Phone, MapPin, User, Calendar, DollarSign, Building2, Users, Clock, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { useEmployees } from '../hooks/useEmployees';
import { getDepartmentColor } from '../utils/mockData';

interface EmployeeDetailsProps {
  employeeId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export const EmployeeDetails = ({ employeeId, onBack, onEdit }: EmployeeDetailsProps) => {
  const { getEmployeeById } = useEmployees();
  const employee = getEmployeeById(employeeId);

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3>Employee Not Found</h3>
          <p className="text-muted-foreground mt-2">The requested employee could not be found.</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateYearsOfService = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    
    if (months < 0 || (months === 0 && now.getDate() < start.getDate())) {
      return years - 1;
    }
    return years;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2>Employee Details</h2>
            <p className="text-muted-foreground mt-1">
              Complete information for {employee.firstName} {employee.lastName}
            </p>
          </div>
        </div>
        <Button onClick={() => onEdit(employee.id)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Employee
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Employee Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="mx-auto w-20 h-20 mb-4">
                <AvatarImage src={employee.profilePicture} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {employee.firstName[0]}{employee.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <CardTitle>
                {employee.firstName} {employee.lastName}
              </CardTitle>
              <CardDescription>{employee.position}</CardDescription>
              <div className="flex justify-center items-center space-x-2 mt-4">
                <Badge
                  variant={employee.status === 'active' ? 'default' : 'secondary'}
                  className={employee.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {employee.status === 'active' ? <UserCheck className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                  {employee.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Employee ID: {employee.id.slice(0, 8)}...
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{employee.address || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Work Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Position</p>
                  <p className="font-medium">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Department</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getDepartmentColor(employee.department) }}
                    />
                    <span className="font-medium">{employee.department}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Salary</p>
                    <p className="font-medium">${employee.salary.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate(employee.startDate)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Years of Service</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {calculateYearsOfService(employee.startDate)} 
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    year{calculateYearsOfService(employee.startDate) !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              {employee.emergencyContact || employee.emergencyPhone ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Contact Name</p>
                    <p className="font-medium">{employee.emergencyContact || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Contact Phone</p>
                    <p className="font-medium">{employee.emergencyPhone || 'Not provided'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No emergency contact information provided</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};