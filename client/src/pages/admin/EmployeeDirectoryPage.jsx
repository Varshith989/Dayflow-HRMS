import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Eye,
  CheckCircle2,
  Mail,
  Building,
  X,
  Save,
  Check,
  Download,
  Phone,
  MapPin,
  HeartHandshake,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import demoAvatars from '../../utils/avatars';
import { format } from 'date-fns';
import { useEmployeeInspection } from '../../context/EmployeeInspectionContext';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { FilterBar } from '../../components/ui/FilterBar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';

export const EmployeeDirectoryPage = () => {
  const navigate = useNavigate();
  const { selectEmployee } = useEmployeeInspection();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [density, setDensity] = useState('comfortable');

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Modals & Drawer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New employee form
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: 'employee123',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    phone: '+91 ',
    joiningDate: format(new Date(), 'yyyy-MM-dd'),
    leaveBalance: { paid: 14, sick: 7, unpaid: 0 },
    address: { street: '', city: 'Bengaluru', state: 'Karnataka', zip: '' },
    emergencyContact: { name: '', relation: '', phone: '+91 ' },
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await api.get('/users', { params });
      if (res.data.success) {
        setEmployees(res.data.employees || []);
        if (res.data.departments) setDepartments(res.data.departments);
      }
    } catch (error) {
      toast.error('Failed to load employee directory');
    } finally {
      setLoading(false);
    }
  };

  const isFirstMount = useRef(true);

  useEffect(() => {
    fetchEmployees();
  }, [selectedDept, selectedStatus]);

  // Debounced search
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchEmployees();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email || !newEmployee.designation) {
      toast.error('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/users', newEmployee);
      if (res.data.success) {
        toast.success(res.data.message || 'Employee onboarded successfully');
        setShowAddModal(false);
        setNewEmployee({
          name: '',
          email: '',
          password: 'employee123',
          role: 'employee',
          department: 'Engineering',
          designation: '',
          phone: '+91 ',
          joiningDate: format(new Date(), 'yyyy-MM-dd'),
          leaveBalance: { paid: 14, sick: 7, unpaid: 0 },
          address: { street: '', city: 'Bengaluru', state: 'Karnataka', zip: '' },
          emergencyContact: { name: '', relation: '', phone: '+91 ' },
        });
        fetchEmployees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/users/${selectedEmployee._id}`, selectedEmployee);
      if (res.data.success) {
        toast.success('Employee updated successfully');
        setShowEditModal(false);
        fetchEmployees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating employee');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (employee) => {
    const newStatus = employee.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.put(`/users/${employee._id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status for ${employee.name} updated to ${newStatus}`);
        fetchEmployees();
      }
    } catch (error) {
      toast.error('Failed to change employee status');
    }
  };

  const exportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Status', 'Paid Leaves', 'Sick Leaves'];
    const rows = sortedEmployees.map((e) => [
      e.employeeId,
      `"${e.name}"`,
      e.email,
      e.role,
      `"${e.department}"`,
      `"${e.designation}"`,
      e.status,
      e.leaveBalance?.paid || 0,
      e.leaveBalance?.sick || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dayflow-employees-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Employee roster exported to CSV');
  };

  // Sorting
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const activeFilters = [];
  if (selectedDept !== 'All') {
    activeFilters.push({
      key: 'dept',
      label: 'Dept',
      displayValue: selectedDept,
      onRemove: () => setSelectedDept('All'),
    });
  }
  if (selectedStatus !== 'All') {
    activeFilters.push({
      key: 'status',
      label: 'Status',
      displayValue: selectedStatus,
      onRemove: () => setSelectedStatus('All'),
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Employee Directory
            </h1>
            <Badge variant="neutral" size="sm">
              {employees.length} Personnel
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organization staff profiles, roles, departmental assignments, and leave allowances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={exportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => setShowAddModal(true)}
          >
            Onboard Employee
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter by name, ID, role, or email..."
        filters={[
          {
            key: 'dept',
            label: 'Department',
            value: selectedDept,
            onChange: setSelectedDept,
            options: [
              { label: 'All Departments', value: 'All' },
              { label: 'Engineering', value: 'Engineering' },
              { label: 'Product Design', value: 'Product Design' },
              { label: 'Sales & Marketing', value: 'Sales & Marketing' },
              { label: 'Human Resources', value: 'Human Resources' },
              { label: 'Finance', value: 'Finance' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
              { label: 'All Statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ],
          },
        ]}
        activeFilters={activeFilters}
        onClearAll={() => {
          setSelectedDept('All');
          setSelectedStatus('All');
          setSearch('');
        }}
        density={density}
        onDensityChange={setDensity}
      />

      {/* Employees Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : sortedEmployees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees match your search"
          description="Try broadening your department filters or clearing your search term."
          action={
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setSearch('');
                setSelectedDept('All');
                setSelectedStatus('All');
              }}
            >
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead sortable onSort={() => toggleSort('name')} sortDirection={sortField === 'name' ? sortDir : null}>
                Employee
              </TableHead>
              <TableHead sortable onSort={() => toggleSort('employeeId')} sortDirection={sortField === 'employeeId' ? sortDir : null}>
                Staff ID & Role
              </TableHead>
              <TableHead sortable onSort={() => toggleSort('department')} sortDirection={sortField === 'department' ? sortDir : null}>
                Department & Title
              </TableHead>
              <TableHead sortable onSort={() => toggleSort('status')} sortDirection={sortField === 'status' ? sortDir : null}>
                Status
              </TableHead>
              <TableHead>
                Leave Balances
              </TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {sortedEmployees.map((emp) => (
              <TableRow key={emp._id}>
                {/* Avatar & Name */}
                <TableCell density={density}>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={emp.avatar || demoAvatars.generic(emp.name)}
                      alt={emp.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {emp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {emp.email}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* ID & Role */}
                <TableCell density={density}>
                  <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {emp.employeeId}
                  </span>
                  <div className="mt-0.5">
                    <Badge variant={emp.role === 'admin' ? 'warning' : 'brand'} size="xs">
                      {emp.role}
                    </Badge>
                  </div>
                </TableCell>

                {/* Department & Designation */}
                <TableCell density={density}>
                  <div className="font-medium text-slate-900 dark:text-slate-200">
                    {emp.department}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {emp.designation}
                  </div>
                </TableCell>

                {/* Status Toggle */}
                <TableCell density={density}>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(emp)}
                    title="Click to toggle status"
                    className="group"
                  >
                    <Badge
                      variant={emp.status === 'Active' ? 'success' : 'danger'}
                      dot
                      size="xs"
                      className="cursor-pointer group-hover:ring-1 group-hover:ring-current"
                    >
                      {emp.status}
                    </Badge>
                  </button>
                </TableCell>

                {/* Leave Balances */}
                <TableCell density={density}>
                  <div className="flex items-center gap-1.5 tabular-nums text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Paid: <strong className="text-emerald-600 dark:text-emerald-400">{emp.leaveBalance?.paid ?? 0}</strong>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Sick: <strong className="text-brand-600 dark:text-brand-400">{emp.leaveBalance?.sick ?? 0}</strong>
                    </span>
                  </div>
                </TableCell>

                {/* Row Actions */}
                <TableCell density={density} className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* 360 Inspection Button */}
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Eye}
                      onClick={() => {
                        selectEmployee(emp, 'dashboard');
                        navigate('/admin/employee-view');
                      }}
                      title="Inspect 360° Context"
                    >
                      <span className="hidden sm:inline">360° View</span>
                    </Button>

                    {/* Quick View Drawer */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setViewDrawerOpen(true);
                      }}
                      title="Quick Preview"
                      className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Details */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(JSON.parse(JSON.stringify(emp)));
                        setShowEditModal(true);
                      }}
                      title="Edit Employee"
                      className="p-1 rounded-md text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* QUICK VIEW DRAWER */}
      <Drawer
        isOpen={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        title={selectedEmployee?.name}
        subtitle={`${selectedEmployee?.designation} • ${selectedEmployee?.department}`}
        footer={
          <>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setViewDrawerOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="xs"
              icon={ExternalLink}
              onClick={() => {
                selectEmployee(selectedEmployee, 'dashboard');
                navigate('/admin/employee-view');
              }}
            >
              Full 360° Inspection
            </Button>
          </>
        }
      >
        {selectedEmployee && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800">
              <img
                src={selectedEmployee.avatar || demoAvatars.generic(selectedEmployee.name)}
                alt={selectedEmployee.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-300 dark:border-slate-700"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedEmployee.name}
                </h4>
                <p className="text-slate-500">{selectedEmployee.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="brand" size="xs">
                    {selectedEmployee.employeeId}
                  </Badge>
                  <Badge variant={selectedEmployee.status === 'Active' ? 'success' : 'danger'} dot size="xs">
                    {selectedEmployee.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Employment & Role
              </h5>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Department</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedEmployee.department}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Designation</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedEmployee.designation}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Joining Date</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedEmployee.joiningDate ? format(new Date(selectedEmployee.joiningDate), 'MMM do, yyyy') : '—'}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Phone</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{selectedEmployee.phone || '—'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Leave Balances
              </h5>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded text-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Paid</span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                    {selectedEmployee.leaveBalance?.paid || 0}
                  </span>
                </div>
                <div className="p-2 rounded text-center bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40">
                  <span className="text-[10px] text-brand-600 dark:text-brand-400 block font-medium">Sick</span>
                  <span className="text-base font-bold text-brand-700 dark:text-brand-300">
                    {selectedEmployee.leaveBalance?.sick || 0}
                  </span>
                </div>
                <div className="p-2 rounded text-center bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-medium">Unpaid</span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                    {selectedEmployee.leaveBalance?.unpaid || 0}
                  </span>
                </div>
              </div>
            </div>

            {selectedEmployee.emergencyContact?.name && (
              <div className="space-y-2">
                <h5 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Emergency Contact
                </h5>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {selectedEmployee.emergencyContact.name}{' '}
                    <span className="text-slate-400">({selectedEmployee.emergencyContact.relation})</span>
                  </div>
                  <div className="text-slate-500">{selectedEmployee.emergencyContact.phone}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* ONBOARD NEW EMPLOYEE MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Onboard New Employee"
        subtitle="Provision employee profile, initial credentials, and departmental assignment"
        icon={UserPlus}
        size="lg"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Rahul Verma"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            />
            <Input
              label="Work Email"
              type="email"
              required
              placeholder="e.g. rahul@dayflow.com"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product Design">Product Design</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <Input
              label="Job Title / Designation"
              required
              placeholder="e.g. Frontend Engineer"
              value={newEmployee.designation}
              onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Role Permission <span className="text-rose-500">*</span>
              </label>
              <select
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="employee">Employee</option>
                <option value="admin">HR Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Contact Phone"
              placeholder="+91 9876543210"
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
            />
            <Input
              label="Joining Date"
              type="date"
              value={newEmployee.joiningDate}
              onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <strong>Default Password:</strong> An initial temporary password <code>employee123</code> is assigned. The staff member will be required to configure their security settings upon first authentication.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={actionLoading}
              icon={UserPlus}
            >
              Onboard Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT EMPLOYEE MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Profile: ${selectedEmployee?.name}`}
        subtitle="Modify employment status, department, and contact information"
        icon={Edit2}
        size="lg"
      >
        {selectedEmployee && (
          <form onSubmit={handleUpdateEmployee} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Full Name"
                required
                value={selectedEmployee.name}
                onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
              />
              <Input
                label="Work Email"
                type="email"
                required
                value={selectedEmployee.email}
                onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <select
                  value={selectedEmployee.department}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })}
                  className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <Input
                label="Designation"
                value={selectedEmployee.designation}
                onChange={(e) => setSelectedEmployee({ ...selectedEmployee, designation: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  value={selectedEmployee.status}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, status: e.target.value })}
                  className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Phone"
                value={selectedEmployee.phone || ''}
                onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
              />
              <Input
                label="City / Location"
                value={selectedEmployee.address?.city || ''}
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    address: { ...(selectedEmployee.address || {}), city: e.target.value },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={actionLoading}
                icon={Save}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeDirectoryPage;
