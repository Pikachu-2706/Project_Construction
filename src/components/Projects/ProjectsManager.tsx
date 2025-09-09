
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, FileText, Building, Users, Package, ShoppingBag, Upload, Download } from 'lucide-react';
import DataTable from '../Common/DataTable';
import Modal from '../Common/Modal';
import { ProjectMaster, PendingAction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { exportToCSV, downloadTemplate } from '../../utils/exportUtils';

// Define section configuration for each project type
const sectionConfig = {
  corporate_building: {
    showBasicInfo: true,
    showContactInfo: true,
    showLocationDetails: true,
    showTypeSpecificFields: true,
    showPricingInfo: true,
    showAdditionalInfo: true,
  },
  coworking_space: {
    showBasicInfo: true,
    showContactInfo: true,
    showLocationDetails: true,
    showTypeSpecificFields: true,
    showPricingCoworkingSpace: true,
    showPricingInfo: false,
    showAdditionalInfo: true,
  },
  warehouse: {
    showBasicInfo: true,
    showContactInfo: true,
    showLocationDetails: true,
    showTypeSpecificFields: true,
    showPricingInfo: true,
    showAdditionalInfo: true,
  },
  retail_mall: {
    showBasicInfo: true,
    showContactInfo: true,
    showLocationDetails: true,
    showTypeSpecificFields: true,
    showPricingInfo: true,
    showAdditionalInfo: true,
  },
};

// Function to create pending actions for employees
const createPendingAction = (
  type: 'create' | 'update' | 'delete',
  module: string,
  data: any,
  originalData?: any,
  user?: any
) => {
  if (!user) {
    alert('User information is missing.');
    return;
  }
  const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
  const newAction: PendingAction = {
    id: Date.now().toString(),
    type,
    module,
    data,
    originalData,
    requestedBy: user.id || '',
    requestedByName: user.name || '',
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };
  pendingActions.push(newAction);
  localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
};

const ProjectsManager: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectMaster[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectMaster | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectMaster | null>(null);
  const [activeTab, setActiveTab] = useState<'corporate_building' | 'coworking_space' | 'warehouse' | 'retail_mall'>('corporate_building');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: 'corporate_building' as ProjectMaster['type'],
    name: '',
    grade: 'A' as ProjectMaster['grade'],
    developerOwner: '',
    contactNo: '',
    alternateNo: '',
    email: '',
    city: '',
    location: '',
    landmark: '',
    googleLocation: '',
    noOfFloors: '',
    floorPlate: '',
    noOfSeats: '',
    availabilityOfSeats: '',
    perOpenDeskCost: '',
    perDedicatedDeskCost: '',
    setupFees: '',
    noOfWarehouses: '',
    warehouseSize: '',
    totalArea: '',
    efficiency: '',
    floorPlateArea: '',
    rentPerSqft: '',
    camPerSqft: '',
    amenities: '',
    remark: '',
    status: 'Active' as ProjectMaster['status'],
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    // Focus on name input when modal opens
    if (showModal) {
      nameInputRef.current?.focus();
    }
  }, [showModal]);

  const loadProjects = () => {
    const storedProjects: ProjectMaster[] = JSON.parse(localStorage.getItem('projects') || '[]');
    setProjects(storedProjects);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.developerOwner) newErrors.developerOwner = 'Developer/Owner is required';
    if (!formData.contactNo || !/^\d{10}$/.test(formData.contactNo)) newErrors.contactNo = 'Valid 10-digit contact number is required';
    if (formData.alternateNo && !/^\d{10}$/.test(formData.alternateNo)) newErrors.alternateNo = 'Valid 10-digit alternate contact number is required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (formData.googleLocation && !/^https?:\/\/maps\.google\.com\/.*$/.test(formData.googleLocation)) newErrors.googleLocation = 'Valid Google Maps URL is required';
    if (activeTab === 'corporate_building') {
      if (formData.noOfFloors && isNaN(parseInt(formData.noOfFloors))) newErrors.noOfFloors = 'Number of Floors must be a valid number';
      if (!formData.rentPerSqft || isNaN(parseFloat(formData.rentPerSqft))) newErrors.rentPerSqft = 'Rent per Sq.ft is required';
      if (!formData.camPerSqft || isNaN(parseFloat(formData.camPerSqft))) newErrors.camPerSqft = 'CAM per Sq.ft is required';
    }
    if (activeTab === 'coworking_space') {
      if (formData.noOfSeats && isNaN(parseInt(formData.noOfSeats))) newErrors.noOfSeats = 'Number of Seats must be a valid number';
      if (formData.availabilityOfSeats && isNaN(parseInt(formData.availabilityOfSeats))) newErrors.availabilityOfSeats = 'Availability of Seats must be a valid number';
      if (formData.noOfSeats && formData.availabilityOfSeats) {
        const noOfSeats = parseInt(formData.noOfSeats);
        const availabilityOfSeats = parseInt(formData.availabilityOfSeats);
        if (availabilityOfSeats > noOfSeats) newErrors.availabilityOfSeats = 'Availability of Seats cannot exceed Number of Seats';
      }
      if (formData.perOpenDeskCost && isNaN(parseFloat(formData.perOpenDeskCost))) newErrors.perOpenDeskCost = 'Per Open Desk Cost must be a valid number';
      if (formData.perDedicatedDeskCost && isNaN(parseFloat(formData.perDedicatedDeskCost))) newErrors.perDedicatedDeskCost = 'Per Dedicated Desk Cost must be a valid number';
      if (formData.setupFees && isNaN(parseFloat(formData.setupFees))) newErrors.setupFees = 'Setup Fees must be a valid number';
    }
    if (activeTab === 'warehouse') {
      if (formData.noOfWarehouses && isNaN(parseInt(formData.noOfWarehouses))) newErrors.noOfWarehouses = 'Number of Warehouses must be a valid number';
      if (!formData.rentPerSqft || isNaN(parseFloat(formData.rentPerSqft))) newErrors.rentPerSqft = 'Rent per Sq.ft is required';
      if (!formData.camPerSqft || isNaN(parseFloat(formData.camPerSqft))) newErrors.camPerSqft = 'CAM per Sq.ft is required';
    }
    if (activeTab === 'retail_mall') {
      if (!formData.rentPerSqft || isNaN(parseFloat(formData.rentPerSqft))) newErrors.rentPerSqft = 'Rent per Sq.ft is required';
      if (!formData.camPerSqft || isNaN(parseFloat(formData.camPerSqft))) newErrors.camPerSqft = 'CAM per Sq.ft is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const projectData = {
      ...formData,
      noOfFloors: formData.noOfFloors ? parseInt(formData.noOfFloors) || undefined : undefined,
      noOfSeats: formData.noOfSeats ? parseInt(formData.noOfSeats) || undefined : undefined,
      availabilityOfSeats: formData.availabilityOfSeats ? parseInt(formData.availabilityOfSeats) || undefined : undefined,
      perOpenDeskCost: formData.perOpenDeskCost ? parseFloat(formData.perOpenDeskCost) || undefined : undefined,
      perDedicatedDeskCost: formData.perDedicatedDeskCost ? parseFloat(formData.perDedicatedDeskCost) || undefined : undefined,
      setupFees: formData.setupFees ? parseFloat(formData.setupFees) || undefined : undefined,
      noOfWarehouses: formData.noOfWarehouses ? parseInt(formData.noOfWarehouses) || undefined : undefined,
      rentPerSqft: formData.rentPerSqft ? parseFloat(formData.rentPerSqft) || undefined : undefined,
      camPerSqft: formData.camPerSqft ? parseFloat(formData.camPerSqft) || undefined : undefined,
    };

    const allProjects: ProjectMaster[] = JSON.parse(localStorage.getItem('projects') || '[]');

    if (user?.role === 'employee') {
      if (editingProject) {
        createPendingAction('update', 'projects', { ...editingProject, ...projectData }, editingProject, user);
      } else {
        const newProject: ProjectMaster = {
          id: Date.now().toString(),
          ...projectData,
          createdAt: new Date().toISOString().split('T')[0],
        };
        createPendingAction('create', 'projects', newProject, undefined, user);
      }
      alert('Your request has been sent to admin for approval.');
    } else {
      if (editingProject) {
        const updatedProjects = allProjects.map((project) =>
          project.id === editingProject.id ? { ...project, ...projectData } : project
        );
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
      } else {
        const newProject: ProjectMaster = {
          id: Date.now().toString(),
          ...projectData,
          createdAt: new Date().toISOString().split('T')[0],
        };
        allProjects.push(newProject);
        localStorage.setItem('projects', JSON.stringify(allProjects));
      }
      loadProjects();
    }

    resetForm();
    setShowModal(false);
  };

  const handleEdit = (project: ProjectMaster) => {
    setEditingProject(project);
    setFormData({
      type: project.type,
      name: project.name,
      grade: project.grade,
      developerOwner: project.developerOwner,
      contactNo: project.contactNo,
      alternateNo: project.alternateNo || '',
      email: project.email,
      city: project.city,
      location: project.location,
      landmark: project.landmark || '',
      googleLocation: project.googleLocation || '',
      noOfFloors: project.noOfFloors?.toString() || '',
      floorPlate: project.floorPlate || '',
      noOfSeats: project.noOfSeats?.toString() || '',
      availabilityOfSeats: project.availabilityOfSeats?.toString() || '',
      perOpenDeskCost: project.perOpenDeskCost?.toString() || '',
      perDedicatedDeskCost: project.perDedicatedDeskCost?.toString() || '',
      setupFees: project.setupFees?.toString() || '',
      noOfWarehouses: project.noOfWarehouses?.toString() || '',
      warehouseSize: project.warehouseSize || '',
      totalArea: project.totalArea || '',
      efficiency: project.efficiency || '',
      floorPlateArea: project.floorPlateArea || '',
      rentPerSqft: project.rentPerSqft?.toString() || '',
      camPerSqft: project.camPerSqft?.toString() || '',
      amenities: project.amenities || '',
      remark: project.remark || '',
      status: project.status,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (project: ProjectMaster) => {
    if (user?.role === 'employee') {
      if (window.confirm('Your delete request will be sent to admin for approval. Continue?')) {
        createPendingAction('delete', 'projects', project, undefined, user);
        alert('Delete request sent to admin for approval.');
      }
    } else {
      if (window.confirm('Are you sure you want to delete this project?')) {
        const allProjects: ProjectMaster[] = JSON.parse(localStorage.getItem('projects') || '[]');
        const updatedProjects = allProjects.filter((p) => p.id !== project.id);
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        loadProjects();
      }
    }
  };

  const handleViewDetails = (project: ProjectMaster) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: activeTab,
      name: '',
      grade: 'A',
      developerOwner: '',
      contactNo: '',
      alternateNo: '',
      email: '',
      city: '',
      location: '',
      landmark: '',
      googleLocation: '',
      noOfFloors: '',
      floorPlate: '',
      noOfSeats: '',
      availabilityOfSeats: '',
      perOpenDeskCost: '',
      perDedicatedDeskCost: '',
      setupFees: '',
      noOfWarehouses: '',
      warehouseSize: '',
      totalArea: '',
      efficiency: '',
      floorPlateArea: '',
      rentPerSqft: '',
      camPerSqft: '',
      amenities: '',
      remark: '',
      status: 'Active',
    });
    setEditingProject(null);
    setErrors({});
  };

  const handleExport = () => {
    const filteredProjects = projects.filter((project) => project.type === activeTab);
    exportToCSV(filteredProjects, `${activeTab}_projects`);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter((line) => line.trim());
        if (lines.length < 1) {
          alert('Empty or invalid CSV file.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim());
        const requiredHeaders = ['name', 'grade', 'developerOwner', 'contactNo', 'city', 'location'];
        const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
        if (missingHeaders.length > 0) {
          alert(`Missing required headers: ${missingHeaders.join(', ')}`);
          return;
        }

        const importedProjects = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          const project: Partial<ProjectMaster> = {};
          headers.forEach((header, index) => {
            const key = header as keyof ProjectMaster;
            if (['noOfFloors', 'noOfSeats', 'availabilityOfSeats', 'noOfWarehouses'].includes(key)) {
              (project as any)[key] = values[index] ? parseInt(values[index]) || undefined : undefined;
            } else if (
              ['perOpenDeskCost', 'perDedicatedDeskCost', 'setupFees', 'rentPerSqft', 'camPerSqft'].includes(key)
            ) {
              (project as any)[key] = values[index] ? parseFloat(values[index]) || undefined : undefined;
            } else {
              (project as any)[key] = values[index] || '';
            }
          });
          return {
            ...project,
            id: Date.now().toString() + Math.random(),
            type: activeTab,
            createdAt: new Date().toISOString().split('T')[0],
          } as ProjectMaster;
        });

        if (user?.role === 'employee') {
          importedProjects.forEach((project) => {
            createPendingAction('create', 'projects', project, undefined, user);
          });
          alert(`${importedProjects.length} projects sent to admin for approval.`);
        } else {
          const allProjects: ProjectMaster[] = JSON.parse(localStorage.getItem('projects') || '[]');
          const updatedProjects = [...allProjects, ...importedProjects];
          localStorage.setItem('projects', JSON.stringify(updatedProjects));
          loadProjects();
        }
      };
      reader.onerror = () => alert('Error reading CSV file.');
      reader.readAsText(file);
    };
    input.click();
  };

  const filteredProjects = projects.filter((project) => project.type === activeTab);

  const getColumns = () => {
    const baseColumns = [
      { key: 'name', label: 'Name', sortable: true },
      {
        key: 'grade',
        label: 'Grade',
        sortable: true,
        render: (value: string) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              value === 'A' ? 'bg-green-100 text-green-800' : value === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}
          >
            Grade {value}
          </span>
        ),
      },
      { key: 'developerOwner', label: 'Developer / Owner', sortable: true },
      { key: 'contactNo', label: 'Contact No.', sortable: true },
      { key: 'city', label: 'City', sortable: true },
      { key: 'location', label: 'Location', sortable: true },
      { key: 'landmark', label: 'Landmark', sortable: true },
    ];

    if (activeTab === 'corporate_building') {
      baseColumns.push(
        { key: 'noOfFloors', label: 'No. of Floors', sortable: true },
        { key: 'floorPlate', label: 'Floor Plate', sortable: true },
        { key: 'rentPerSqft', label: 'Rent (per Sq.ft)', sortable: true },
        { key: 'camPerSqft', label: 'CAM (per Sq.ft)', sortable: true }
      );
    } else if (activeTab === 'coworking_space') {
      baseColumns.push(
        { key: 'noOfSeats', label: 'No. of Seats', sortable: true },
        { key: 'availabilityOfSeats', label: 'Availability of Seats', sortable: true }
      );
    } else if (activeTab === 'warehouse') {
      baseColumns.push(
        { key: 'noOfWarehouses', label: 'No. of Warehouses', sortable: true },
        { key: 'warehouseSize', label: 'Warehouse Size', sortable: true }
      );
    } else if (activeTab === 'retail_mall') {
      baseColumns.push(
        { key: 'totalArea', label: 'Total Area', sortable: true },
        { key: 'efficiency', label: 'Efficiency', sortable: true }
      );
    }

    baseColumns.push({
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === 'Active' ? 'bg-green-100 text-green-800' : value === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value}
        </span>
      ),
    });

    return baseColumns;
  };

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: handleViewDetails,
      variant: 'secondary' as const,
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: handleEdit,
      variant: 'primary' as const,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: handleDelete,
      variant: 'danger' as const,
    },
  ];

  const getTabLabel = (type: string) => {
    switch (type) {
      case 'corporate_building':
        return 'Corporate Building';
      case 'coworking_space':
        return 'Coworking Spaces';
      case 'warehouse':
        return 'Warehouse';
      case 'retail_mall':
        return 'Retail / Mall';
      default:
        return type;
    }
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'corporate_building':
        return <Building className="w-4 h-4" />;
      case 'coworking_space':
        return <Users className="w-4 h-4" />;
      case 'warehouse':
        return <Package className="w-4 h-4" />;
      case 'retail_mall':
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Project Master</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage project master data across different categories</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={() => downloadTemplate(getColumns().map(col => col.key), `${activeTab}_projects_template.csv`)}
            className="inline-flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Download projects template"
          >
            <FileText className="h-4 w-4" />
            <span>Template</span>
          </button>
          <button
            onClick={handleImport}
            className="inline-flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
            aria-label="Import projects from CSV"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            aria-label="Export projects to CSV"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setFormData({ ...formData, type: activeTab });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            aria-label={`Add new ${getTabLabel(activeTab)}`}
          >
            <Plus className="h-4 w-4" />
            <span>Add {getTabLabel(activeTab)}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-4 sm:space-x-8 min-w-max" role="tablist">
          {[
            { id: 'corporate_building', label: 'Corporate Building' },
            { id: 'coworking_space', label: 'Coworking Spaces' },
            { id: 'warehouse', label: 'Warehouse' },
            { id: 'retail_mall', label: 'Retail / Mall' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'corporate_building' | 'coworking_space' | 'warehouse' | 'retail_mall')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={`View ${tab.label} list`}
            >
              {getTabIcon(tab.id)}
              <span>{tab.label}</span>
              <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                {projects.filter((p) => p.type === tab.id).length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="overflow-hidden">
        <DataTable
          data={filteredProjects}
          columns={getColumns()}
          actions={actions}
          searchable={true}
          exportable={false}
          importable={false}
          title={`${getTabLabel(activeTab)} Projects`}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingProject ? `Edit ${getTabLabel(activeTab)}` : `Add ${getTabLabel(activeTab)}`}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Basic Information Section */}
          {sectionConfig[activeTab].showBasicInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {getTabLabel(activeTab)} Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    ref={nameInputRef}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && <p id="name-error" className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                    Grade *
                  </label>
                  <select
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as ProjectMaster['grade'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="developerOwner" className="block text-sm font-medium text-gray-700 mb-2">
                    Developer / Owner *
                  </label>
                  <input
                    id="developerOwner"
                    type="text"
                    value={formData.developerOwner}
                    onChange={(e) => setFormData({ ...formData, developerOwner: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.developerOwner ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    aria-invalid={!!errors.developerOwner}
                    aria-describedby={errors.developerOwner ? 'developerOwner-error' : undefined}
                  />
                  {errors.developerOwner && <p id="developerOwner-error" className="text-red-500 text-xs mt-1">{errors.developerOwner}</p>}
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectMaster['status'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Construction">Under Construction</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Section */}
          {sectionConfig[activeTab].showContactInfo && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact No. *
                  </label>
                  <input
                    id="contactNo"
                    type="tel"
                    value={formData.contactNo}
                    onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.contactNo ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    aria-invalid={!!errors.contactNo}
                    aria-describedby={errors.contactNo ? 'contactNo-error' : undefined}
                  />
                  {errors.contactNo && <p id="contactNo-error" className="text-red-500 text-xs mt-1">{errors.contactNo}</p>}
                </div>
                <div>
                  <label htmlFor="alternateNo" className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate No.
                  </label>
                  <input
                    id="alternateNo"
                    type="tel"
                    value={formData.alternateNo}
                    onChange={(e) => setFormData({ ...formData, alternateNo: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.alternateNo ? 'border-red-500' : 'border-gray-300'}`}
                    aria-invalid={!!errors.alternateNo}
                    aria-describedby={errors.alternateNo ? 'alternateNo-error' : undefined}
                  />
                  {errors.alternateNo && <p id="alternateNo-error" className="text-red-500 text-xs mt-1">{errors.alternateNo}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Location Details Section */}
          {sectionConfig[activeTab].showLocationDetails && (
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Location Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                  />
                  {errors.city && <p id="city-error" className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    aria-invalid={!!errors.location}
                    aria-describedby={errors.location ? 'location-error' : undefined}
                  />
                  {errors.location && <p id="location-error" className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
                <div>
                  <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-2">
                    Landmarks
                  </label>
                  <input
                    id="landmark"
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="googleLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    Google Location
                  </label>
                  <input
                    id="googleLocation"
                    type="url"
                    value={formData.googleLocation}
                    onChange={(e) => setFormData({ ...formData, googleLocation: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.googleLocation ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="https://maps.google.com/..."
                    aria-invalid={!!errors.googleLocation}
                    aria-describedby={errors.googleLocation ? 'googleLocation-error' : undefined}
                  />
                  {errors.googleLocation && <p id="googleLocation-error" className="text-red-500 text-xs mt-1">{errors.googleLocation}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Type-specific fields */}
          {sectionConfig[activeTab].showTypeSpecificFields && (
            <>
              {activeTab === 'corporate_building' && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4">Corporate Building Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="noOfFloors" className="block text-sm font-medium text-gray-700 mb-2">
                        No. of Floors
                      </label>
                      <input
                        id="noOfFloors"
                        type="number"
                        value={formData.noOfFloors}
                        onChange={(e) => setFormData({ ...formData, noOfFloors: e.target.value })}
                        min="0"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.noOfFloors ? 'border-red-500' : 'border-gray-300'}`}
                        aria-invalid={!!errors.noOfFloors}
                        aria-describedby={errors.noOfFloors ? 'noOfFloors-error' : undefined}
                      />
                      {errors.noOfFloors && <p id="noOfFloors-error" className="text-red-500 text-xs mt-1">{errors.noOfFloors}</p>}
                    </div>
                    <div>
                      <label htmlFor="floorPlate" className="block text-sm font-medium text-gray-700 mb-2">
                        Floor Plate Size
                      </label>
                      <input
                        id="floorPlate"
                        type="text"
                        value={formData.floorPlate}
                        onChange={(e) => setFormData({ ...formData, floorPlate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'coworking_space' && (
                <>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Coworking Spaces Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="noOfSeats" className="block text-sm font-medium text-gray-700 mb-2">
                          No. of Seats
                        </label>
                        <input
                          id="noOfSeats"
                          type="number"
                          value={formData.noOfSeats}
                          onChange={(e) => setFormData({ ...formData, noOfSeats: e.target.value })}
                          min="0"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.noOfSeats ? 'border-red-500' : 'border-gray-300'}`}
                          aria-invalid={!!errors.noOfSeats}
                          aria-describedby={errors.noOfSeats ? 'noOfSeats-error' : undefined}
                        />
                        {errors.noOfSeats && <p id="noOfSeats-error" className="text-red-500 text-xs mt-1">{errors.noOfSeats}</p>}
                      </div>
                      <div>
                        <label htmlFor="availabilityOfSeats" className="block text-sm font-medium text-gray-700 mb-2">
                          Availability of Seats
                        </label>
                        <input
                          id="availabilityOfSeats"
                          type="number"
                          value={formData.availabilityOfSeats}
                          onChange={(e) => setFormData({ ...formData, availabilityOfSeats: e.target.value })}
                          min="0"
                          max={formData.noOfSeats || undefined}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.availabilityOfSeats ? 'border-red-500' : 'border-gray-300'}`}
                          aria-invalid={!!errors.availabilityOfSeats}
                          aria-describedby={errors.availabilityOfSeats ? 'availabilityOfSeats-error' : undefined}
                        />
                        {errors.availabilityOfSeats && <p id="availabilityOfSeats-error" className="text-red-500 text-xs mt-1">{errors.availabilityOfSeats}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200 mt-6">
                    <h3 className="text-lg font-semibold text-rose-900 mb-4">Pricing Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="perOpenDeskCost" className="block text-sm font-medium text-gray-700 mb-2">
                          Per Open Desk Cost
                        </label>
                        <input
                          id="perOpenDeskCost"
                          type="number"
                          value={formData.perOpenDeskCost}
                          onChange={(e) => setFormData({ ...formData, perOpenDeskCost: e.target.value })}
                          min="0"
                          step="0.01"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.perOpenDeskCost ? 'border-red-500' : 'border-gray-300'}`}
                          aria-invalid={!!errors.perOpenDeskCost}
                          aria-describedby={errors.perOpenDeskCost ? 'perOpenDeskCost-error' : undefined}
                        />
                        {errors.perOpenDeskCost && <p id="perOpenDeskCost-error" className="text-red-500 text-xs mt-1">{errors.perOpenDeskCost}</p>}
                      </div>
                      <div>
                        <label htmlFor="perDedicatedDeskCost" className="block text-sm font-medium text-gray-700 mb-2">
                          Per Dedicated Desk Cost
                        </label>
                        <input
                          id="perDedicatedDeskCost"
                          type="number"
                          value={formData.perDedicatedDeskCost}
                          onChange={(e) => setFormData({ ...formData, perDedicatedDeskCost: e.target.value })}
                          min="0"
                          step="0.01"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.perDedicatedDeskCost ? 'border-red-500' : 'border-gray-300'}`}
                          aria-invalid={!!errors.perDedicatedDeskCost}
                          aria-describedby={errors.perDedicatedDeskCost ? 'perDedicatedDeskCost-error' : undefined}
                        />
                        {errors.perDedicatedDeskCost && <p id="perDedicatedDeskCost-error" className="text-red-500 text-xs mt-1">{errors.perDedicatedDeskCost}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="setupFees" className="block text-sm font-medium text-gray-700 mb-2">
                          Setup Fees
                        </label>
                        <input
                          id="setupFees"
                          type="number"
                          value={formData.setupFees}
                          onChange={(e) => setFormData({ ...formData, setupFees: e.target.value })}
                          min="0"
                          step="0.01"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.setupFees ? 'border-red-500' : 'border-gray-300'}`}
                          aria-invalid={!!errors.setupFees}
                          aria-describedby={errors.setupFees ? 'setupFees-error' : undefined}
                        />
                        {errors.setupFees && <p id="setupFees-error" className="text-red-500 text-xs mt-1">{errors.setupFees}</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'warehouse' && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4">Warehouse Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="noOfWarehouses" className="block text-sm font-medium text-gray-700 mb-2">
                        No. of Warehouses
                      </label>
                      <input
                        id="noOfWarehouses"
                        type="number"
                        value={formData.noOfWarehouses}
                        onChange={(e) => setFormData({ ...formData, noOfWarehouses: e.target.value })}
                        min="0"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.noOfWarehouses ? 'border-red-500' : 'border-gray-300'}`}
                        aria-invalid={!!errors.noOfWarehouses}
                        aria-describedby={errors.noOfWarehouses ? 'noOfWarehouses-error' : undefined}
                      />
                      {errors.noOfWarehouses && <p id="noOfWarehouses-error" className="text-red-500 text-xs mt-1">{errors.noOfWarehouses}</p>}
                    </div>
                    <div>
                      <label htmlFor="warehouseSize" className="block text-sm font-medium text-gray-700 mb-2">
                        Warehouse Size
                      </label>
                      <input
                        id="warehouseSize"
                        type="text"
                        value={formData.warehouseSize}
                        onChange={(e) => setFormData({ ...formData, warehouseSize: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'retail_mall' && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4">Retail / Mall Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700 mb-2">
                        Total Area
                      </label>
                      <input
                        id="totalArea"
                        type="text"
                        value={formData.totalArea}
                        onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="efficiency" className="block text-sm font-medium text-gray-700 mb-2">
                        Efficiency
                      </label>
                      <input
                        id="efficiency"
                        type="text"
                        value={formData.efficiency}
                        onChange={(e) => setFormData({ ...formData, efficiency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="floorPlateArea" className="block text-sm font-medium text-gray-700 mb-2">
                        Floor Plate Area
                      </label>
                      <input
                        id="floorPlateArea"
                        type="text"
                        value={formData.floorPlateArea}
                        onChange={(e) => setFormData({ ...formData, floorPlateArea: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pricing Information Section */}
          {sectionConfig[activeTab].showPricingInfo && (
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200">
              <h3 className="text-lg font-semibold text-rose-900 mb-4">Pricing Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rentPerSqft" className="block text-sm font-medium text-gray-700 mb-2">
                    Rent (per Sq.ft) *
                  </label>
                  <input
                    id="rentPerSqft"
                    type="number"
                    value={formData.rentPerSqft}
                    onChange={(e) => setFormData({ ...formData, rentPerSqft: e.target.value })}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.rentPerSqft ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    aria-invalid={!!errors.rentPerSqft}
                    aria-describedby={errors.rentPerSqft ? 'rentPerSqft-error' : undefined}
                  />
                  {errors.rentPerSqft && <p id="rentPerSqft-error" className="text-red-500 text-xs mt-1">{errors.rentPerSqft}</p>}
                </div>
                <div>
                  <label htmlFor="camPerSqft" className="block text-sm font-medium text-gray-700 mb-2">
                    CAM (per Sq.ft) *
                  </label>
                  <input
                    id="camPerSqft"
                    type="number"
                    value={formData.camPerSqft}
                    onChange={(e) => setFormData({ ...formData, camPerSqft: e.target.value })}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.camPerSqft ? 'border-red-500' : 'border-gray-300'}`}
                    required
                    aria-invalid={!!errors.camPerSqft}
                    aria-describedby={errors.camPerSqft ? 'camPerSqft-error' : undefined}
                  />
                  {errors.camPerSqft && <p id="camPerSqft-error" className="text-red-500 text-xs mt-1">{errors.camPerSqft}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Additional Information Section */}
          {sectionConfig[activeTab].showAdditionalInfo && (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <textarea
                    id="amenities"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={3}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-2">
                    Remark
                  </label>
                  <textarea
                    id="remark"
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              aria-label="Cancel form"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={Object.keys(errors).length > 0}
              aria-label={editingProject ? `Save Changes to ${getTabLabel(activeTab)}` : `Add ${getTabLabel(activeTab)}`}
            >
              {editingProject ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      {selectedProject && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProject(null);
          }}
          title={`Project Details: ${selectedProject.name}`}
          size="lg"
        >
          <div className="space-y-6">
            {sectionConfig[activeTab].showBasicInfo && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900 font-medium">{selectedProject.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Grade</label>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        selectedProject.grade === 'A'
                          ? 'bg-green-100 text-green-800'
                          : selectedProject.grade === 'B'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Grade {selectedProject.grade}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Developer / Owner</label>
                    <p className="text-sm text-gray-900">{selectedProject.developerOwner}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        selectedProject.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : selectedProject.status === 'Inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedProject.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {sectionConfig[activeTab].showContactInfo && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact No.</label>
                    <p className="text-sm text-gray-900">{selectedProject.contactNo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Alternate No.</label>
                    <p className="text-sm text-gray-900">{selectedProject.alternateNo || 'N/A'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{selectedProject.email}</p>
                  </div>
                </div>
              </div>
            )}
            {sectionConfig[activeTab].showLocationDetails && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Location Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">City</label>
                    <p className="text-sm text-gray-900">{selectedProject.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Location</label>
                    <p className="text-sm text-gray-900">{selectedProject.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Landmarks</label>
                    <p className="text-sm text-gray-900">{selectedProject.landmark || 'N/A'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Google Location</label>
                    {selectedProject.googleLocation ? (
                      <a
                        href={selectedProject.googleLocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {selectedProject.googleLocation}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-900">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {sectionConfig[activeTab].showTypeSpecificFields && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">{getTabLabel(activeTab)} Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeTab === 'corporate_building' && (
                    <>
                      {selectedProject.noOfFloors && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">No. of Floors</label>
                          <p className="text-sm text-gray-900">{selectedProject.noOfFloors}</p>
                        </div>
                      )}
                      {selectedProject.floorPlate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Floor Plate Size</label>
                          <p className="text-sm text-gray-900">{selectedProject.floorPlate}</p>
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === 'coworking_space' && (
                    <>
                      {selectedProject.noOfSeats && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">No. of Seats</label>
                          <p className="text-sm text-gray-900">{selectedProject.noOfSeats}</p>
                        </div>
                      )}
                      {selectedProject.availabilityOfSeats && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Availability of Seats</label>
                          <p className="text-sm text-gray-900">{selectedProject.availabilityOfSeats}</p>
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === 'warehouse' && (
                    <>
                      {selectedProject.noOfWarehouses && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">No. of Warehouses</label>
                          <p className="text-sm text-gray-900">{selectedProject.noOfWarehouses}</p>
                        </div>
                      )}
                      {selectedProject.warehouseSize && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Warehouse Size</label>
                          <p className="text-sm text-gray-900">{selectedProject.warehouseSize}</p>
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === 'retail_mall' && (
                    <>
                      {selectedProject.totalArea && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Total Area</label>
                          <p className="text-sm text-gray-900">{selectedProject.totalArea}</p>
                        </div>
                      )}
                      {selectedProject.efficiency && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Efficiency</label>
                          <p className="text-sm text-gray-900">{selectedProject.efficiency}</p>
                        </div>
                      )}
                      {selectedProject.floorPlateArea && (
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-500">Floor Plate Area</label>
                          <p className="text-sm text-gray-900">{selectedProject.floorPlateArea}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            {sectionConfig[activeTab].showPricingCoworkingSpace && activeTab === 'coworking_space' && (
              <div className="bg-rose-50 p-4 rounded-lg">
                <h4 className="font-medium text-rose-900 mb-2">Pricing Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProject.perOpenDeskCost && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Per Open Desk Cost</label>
                      <p className="text-sm text-gray-900">{selectedProject.perOpenDeskCost}</p>
                    </div>
                  )}
                  {selectedProject.perDedicatedDeskCost && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Per Dedicated Desk Cost</label>
                      <p className="text-sm text-gray-900">{selectedProject.perDedicatedDeskCost}</p>
                    </div>
                  )}
                  {selectedProject.setupFees && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Setup Fees</label>
                      <p className="text-sm text-gray-900">{selectedProject.setupFees}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {sectionConfig[activeTab].showPricingInfo && (
              <div className="bg-rose-50 p-4 rounded-lg">
                <h4 className="font-medium text-rose-900 mb-2">Pricing Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProject.rentPerSqft && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Rent (per Sq.ft)</label>
                      <p className="text-sm text-gray-900">{selectedProject.rentPerSqft}</p>
                    </div>
                  )}
                  {selectedProject.camPerSqft && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">CAM (per Sq.ft)</label>
                      <p className="text-sm text-gray-900">{selectedProject.camPerSqft}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {sectionConfig[activeTab].showAdditionalInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProject.amenities && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Amenities</label>
                      <p className="text-sm text-gray-900">{selectedProject.amenities}</p>
                    </div>
                  )}
                  {selectedProject.remark && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Remark</label>
                      <p className="text-sm text-gray-900">{selectedProject.remark}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedProject(null);
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              aria-label="Close details modal"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsManager;
