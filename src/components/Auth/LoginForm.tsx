import React, { useState } from 'react';
import { Building, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
…            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 