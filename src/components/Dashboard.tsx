import { Users, UserCheck, UserX, DollarSign, Building2, Activity, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useEmployees } from '../hooks/useEmployees';
import { departments, getDepartmentColor } from '../utils/mockData';

export const Dashboard = () => {
  const { getEmployeeStats, getRecentActivity, loading } = useEmployees();
  
  // Get stats with fallback values
  const stats = getEmployeeStats() || {
    total: 0,
    active: 0,
    inactive: 0,
    departmentCounts: {},
    averageSalary: 0
  };
  
  const recentActivity = getRecentActivity() || [];

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Employees',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inactive Employees',
      value: stats.inactive,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Average Salary',
      value: `${stats.averageSalary.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="text-muted-foreground mt-2">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2>Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to the employee management system. Here's an overview of your workforce.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Department Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              const count = (stats.departmentCounts && stats.departmentCounts[dept.name]) || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              return (
                <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}% of workforce
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {count} employee{count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={activity.id || index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.action?.replace('_', ' ').toLowerCase()}
                        </span>
                        {activity.details?.employeeName && (
                          <span> for {activity.details.employeeName}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium">View All Employees</p>
                    <p className="text-sm text-muted-foreground">Browse and manage your team</p>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">Add New Employee</p>
                    <p className="text-sm text-muted-foreground">Onboard a new team member</p>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium">Department Reports</p>
                    <p className="text-sm text-muted-foreground">Analyze department performance</p>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>

              <Separator />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  System last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};