import React, { useState } from 'react';
import { Building, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(formData.emailOrUsername, formData.password);
      if (!success) {
        setError('Invalid email/username or password');
      }
     
      if (formData.emailOrUsername === 'clayton.reynolds' && formData.password === 'Green@7581') {
        window.location.href = '/admin-dashboard';
      } else if ((formData.emailOrUsername === 'prathamesh.tare' || formData.emailOrUsername === 'lavinia.reynolds') && formData.password === 'Green@7581') {
        window.location.href = '/employee-dashboard';
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  
  // Demo credentials helper
  const setDemoCredentials = (username: string, password: string) => {
    setFormData({ emailOrUsername: username, password: password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <div className="text-center mb-8">
            <div>
                <Building className="h-8 w-8 text-white" />
              </div>
              <img 
              src="https://greenearthspaces.com/wp-content/uploads/2021/07/Final-Logo.png" 
              alt="ConstructCRM Logo" 
              className="h-32 w-32"
            />
              <h1 className="text-2xl font-bold text-green-700">EDGE</h1>
              <p className="text-gray-600 mt-2">CRM System Login</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="emailOrUsername"
                    name="emailOrUsername"
                    type="text"
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email or username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Login Credentials:</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('clayton.reynolds', 'Green@7581')}
                className="w-full text-left text-sm text-green-600 hover:text-green-800 transition-colors"
              >
                👤 Admin: clayton.reynolds
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('prathamesh.tase', 'Green@7581')}
                className="w-full text-left text-sm text-green-600 hover:text-green-800 transition-colors"
              >
                👤 User: prathamesh.tase
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('lavinia.reynolds', 'Green@7581')}
                className="w-full text-left text-sm text-green-600 hover:text-green-800 transition-colors"
              >
                👤 User: lavinia.reynolds
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;