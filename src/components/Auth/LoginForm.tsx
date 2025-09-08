import React, { useState, useRef, useEffect } from 'react';
import { Building, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ emailOrUsername?: string; password?: string }>({});
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus on email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Client-side validation
  const validateForm = () => {
    const errors: { emailOrUsername?: string; password?: string } = {};
    const emailOrUsername = formData.emailOrUsername.trim();
    const password = formData.password.trim();

    if (!emailOrUsername) {
      errors.emailOrUsername = 'Email or username is required';
    } else if (emailOrUsername.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername)) {
      errors.emailOrUsername = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors on input change
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const success = await login(formData.emailOrUsername, formData.password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper
  const setDemoCredentials = (username: string, password: string) => {
    setFormData({ emailOrUsername: username, password });
    setFormErrors({});
    emailInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-700">Green Earth Spaces</h1>
              <p className="text-gray-600 mt-2">CRM System Login</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-busy={loading}>
              <div>
                <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-2">
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
                    ref={emailInputRef}
                    required
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      formErrors.emailOrUsername ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="Enter your email or username"
                    aria-describedby={formErrors.emailOrUsername || authError ? 'error-message-email' : undefined}
                    aria-invalid={!!formErrors.emailOrUsername}
                  />
                </div>
                {formErrors.emailOrUsername && (
                  <p id="error-message-email" className="text-red-600 text-sm mt-1 animate-fade-in">
                    {formErrors.emailOrUsername}
                  </p>
                )}
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
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      formErrors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="Enter your password"
                    aria-describedby={formErrors.password || authError ? 'error-message-password' : undefined}
                    aria-invalid={!!formErrors.password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p id="error-message-password" className="text-red-600 text-sm mt-1 animate-fade-in">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {authError && (
                <div
                  id="error-message-server"
                  className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-lg animate-fade-in"
                  role="alert"
                >
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || Object.keys(formErrors).length > 0 || !formData.emailOrUsername || !formData.password}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Credentials:</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('clayton.reynolds', 'Green@7581')}
                className="w-full text-left text-sm text-green-600 hover:text-green-800 transition-colors"
                aria-label="Use admin credentials: clayton.reynolds"
              >
                👤 Admin: clayton.reynolds
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('prathmesh.tare', 'Green@7581')}
                className="w-full text-left text-sm text-green-600 hover:text-green-800 transition-colors"
                aria-label="Use user credentials: prathmesh.tare"
              >
                👤 User: prathmesh.tare
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('lavinia.reynolds', 'Green@7581')}
                className="w-full text-left text-sm text-green-600 hover:text-green-800 transition-colors"
                aria-label="Use user credentials: lavinia.reynolds"
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