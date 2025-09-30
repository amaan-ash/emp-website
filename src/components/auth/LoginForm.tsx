import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Users, Lock, Mail, Eye, EyeOff, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm = ({ onToggleMode }: LoginFormProps) => {
  const { signin, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signin(formData.email, formData.password);
    } catch (error) {
      // Error is handled in the auth context
      console.error('Login form error:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Demo credentials for testing
  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@company.com',
      password: 'demo123456'
    });
    toast.info('Demo credentials filled! Click Sign In to continue.');
  };

  // Test backend connection
  const testConnection = async () => {
    try {
      const { apiClient } = await import('../../utils/api');
      const [health, debug] = await Promise.all([
        apiClient.healthCheck(),
        apiClient.debugStatus()
      ]);
      
      console.log('Health check:', health);
      console.log('Debug status:', debug);
      
      if (debug.demoUserInKV && debug.adminUserInSupabase) {
        toast.success('✅ Backend ready! Demo user is available.');
      } else if (!debug.adminUserInSupabase) {
        toast.error('❌ Demo user not found in Supabase. Server may need restart.');
      } else if (!debug.demoUserInKV) {
        toast.error('❌ Demo user profile missing. Server may need restart.');
      } else {
        toast.success(`Backend connected. Users: ${debug.supabaseUsers} Supabase, ${debug.kvUsers} profiles`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('❌ Backend connection failed. Please check server status.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6" />
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your employee management account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4">
            <Separator className="my-4" />
            <div className="text-center space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fillDemoCredentials}
                  className="flex items-center gap-1"
                >
                  <Users className="h-3 w-3" />
                  Demo Login
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  className="flex items-center gap-1"
                >
                  <Activity className="h-3 w-3" />
                  Test Server
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={onToggleMode}
                >
                  Create account
                </Button>
              </p>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Demo Account:</strong><br />
                Email: admin@company.com<br />
                Password: demo123456
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};