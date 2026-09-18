import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  HeartHandshake,
  Calendar,
  Edit3,
  Save,
  X,
  CalendarDays,
  Sparkles,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Camera,
  Check,
  Shield,
  Phone,
  Mail,
  Building,
  Briefcase,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import demoAvatars from '../utils/avatars';
import api from '../api/client';
import { format } from 'date-fns';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';

const ProfilePage = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);

  // Modals state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '',
    type: 'Government ID',
    fileSize: '1.2 MB',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    department: '',
    designation: '',
    role: 'employee',
    status: 'Active',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
    },
  });

  const fetchDocuments = async () => {
    if (!user?._id && !user?.id) return;
    try {
      setDocLoading(true);
      const res = await api.get(`/users/${user._id || user.id}/documents`);
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        department: user.department || '',
        designation: user.designation || '',
        role: user.role || 'employee',
        status: user.status || 'Active',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zip: user.address?.zip || '',
        },
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          relation: user.emergencyContact?.relation || '',
          phone: user.emergencyContact?.phone || '',
        },
      });
      fetchDocuments();
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/users/${user._id || user.id}`, formData);
      if (res.data.success) {
        updateUser(res.data.employee);
        toast.success('Profile details saved successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAvatar = async (avatarUri) => {
    try {
      setFormData((prev) => ({ ...prev, avatar: avatarUri }));
      const res = await api.put(`/users/${user._id || user.id}`, { avatar: avatarUri });
      if (res.data.success) {
        updateUser(res.data.employee);
        toast.success('Profile picture updated successfully!');
        setShowAvatarModal(false);
      }
    } catch (err) {
      toast.error('Failed to update profile picture');
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.type) {
      toast.error('Please enter document title and select type');
      return;
    }

    try {
      const res = await api.post(`/users/${user._id || user.id}/documents`, newDoc);
      if (res.data.success) {
        toast.success('Document uploaded successfully!');
        setDocuments(res.data.documents || []);
        setShowAddDocModal(false);
        setNewDoc({ name: '', type: 'Government ID', fileSize: '1.2 MB' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add document');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this document from the dossier?')) return;
    try {
      const res = await api.delete(`/users/${user._id || user.id}/documents/${docId}`);
      if (res.data.success) {
        toast.success('Document removed successfully');
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleVerifyDocument = async (docId, newStatus) => {
    try {
      const res = await api.put(`/users/${user._id || user.id}/documents/${docId}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(`Document marked as ${newStatus}`);
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      toast.error('Failed to update document status');
    }
  };

  const copyEmployeeId = () => {
    if (user?.employeeId) {
      navigator.clipboard.writeText(user.employeeId);
      toast.success(`Copied ID: ${user.employeeId}`);
    }
  };

  const avatarOptions = [
    { name: 'Ananya Sharma', subtitle: 'Senior Engineer', uri: demoAvatars.ananya, role: 'Engineering' },
    { name: 'Priya Iyer', subtitle: 'HR Manager', uri: demoAvatars.priya, role: 'Human Resources' },
    { name: 'Rohan Nair', subtitle: 'Lead Designer', uri: demoAvatars.rohan, role: 'UI/UX Design' },
    { name: 'Arjun Menon', subtitle: 'Marketing Director', uri: demoAvatars.arjun, role: 'Marketing' },
    { name: 'Sneha Kulkarni', subtitle: 'Finance Lead', uri: demoAvatars.sneha, role: 'Finance' },
    { name: 'Karthik Reddy', subtitle: 'DevOps Lead', uri: demoAvatars.karthik, role: 'DevOps & Infra' },
  ];

  const formattedJoiningDate = user?.joiningDate
    ? format(new Date(user.joiningDate), 'MMMM dd, yyyy')
    : 'N/A';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Profile Banner Card */}
      <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm overflow-hidden transition-colors">
        {/* Subtle decorative mesh background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Camera badge */}
            <div className="relative group shrink-0">
              <img
                src={
                  formData.avatar ||
                  demoAvatars.generic(user?.name?.slice(0, 2))
                }
                alt={user?.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-800 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                title="Change Profile Picture"
                className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-white cursor-pointer backdrop-blur-[2px]"
              >
                <Camera className="w-4 h-4 text-brand-300" />
                Change
              </button>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                  user?.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={`Status: ${user?.status || 'Active'}`}
              />
            </div>

            {/* Core Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {user?.name}
                </h1>
                <Badge variant={isAdmin ? 'purple' : 'brand'} size="sm" dot>
                  {user?.role === 'admin' ? 'Administrator' : 'Employee'}
                </Badge>
                <button
                  type="button"
                  onClick={copyEmployeeId}
                  title="Click to copy Employee ID"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>{user?.employeeId}</span>
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-800 dark:text-slate-200">{user?.designation}</span>
                <span>•</span>
                <span className="text-brand-600 dark:text-brand-400 font-medium">{user?.department}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {formattedJoiningDate}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Camera}
              onClick={() => setShowAvatarModal(true)}
              className="flex-1 md:flex-initial"
            >
              Change Photo
            </Button>
            <Button
              type="button"
              variant={isEditing ? 'secondary' : 'primary'}
              size="sm"
              icon={isEditing ? X : Edit3}
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 md:flex-initial"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </div>

      {/* Leave Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Paid Leave Balance"
          value={`${user?.leaveBalance?.paid ?? 0} days`}
          subtitle="Annual PTO quota available"
          icon={CalendarDays}
          trend={{ value: 'Full Allowance', isPositive: true }}
        />
        <StatCard
          title="Sick / Medical Leave"
          value={`${user?.leaveBalance?.sick ?? 0} days`}
          subtitle="Medical & health leave reserve"
          icon={HeartHandshake}
          trend={{ value: 'Compliant', isPositive: true }}
        />
        <StatCard
          title="Total Leave Entitlement"
          value={`${(user?.leaveBalance?.paid || 0) + (user?.leaveBalance?.sick || 0)} days`}
          subtitle="Combined active balance"
          icon={Sparkles}
        />
      </div>

      {/* Main Profile Info Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal & Work Details Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Work & Identity Information
              </h3>
              {!isAdmin && (
                <span className="text-[11px] text-slate-400">
                  Role/Dept managed by HR
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                disabled={!isEditing || !isAdmin}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                leftIcon={User}
              />

              <Input
                label="Work Email"
                type="email"
                disabled={!isEditing || !isAdmin}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={Mail}
              />

              <Input
                label="Department"
                disabled={!isEditing || !isAdmin}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                leftIcon={Building}
              />

              <Input
                label="Designation"
                disabled={!isEditing || !isAdmin}
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                leftIcon={Briefcase}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Contact Phone"
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  leftIcon={Phone}
                />
              </div>
            </div>
          </div>

          {/* Contact & Emergency Contact Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Residential & Emergency Contact
              </h3>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <Input
                label="Street Address"
                disabled={!isEditing}
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                placeholder="Street / Flat / Door Number"
                leftIcon={MapPin}
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City"
                  disabled={!isEditing}
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  placeholder="Bengaluru"
                />
                <Input
                  label="State"
                  disabled={!isEditing}
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                  placeholder="Karnataka"
                />
                <Input
                  label="Postal Zip"
                  disabled={!isEditing}
                  value={formData.address.zip}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, zip: e.target.value },
                    })
                  }
                  placeholder="560064"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                Emergency Point of Contact
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Contact Name"
                  disabled={!isEditing}
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                    })
                  }
                  placeholder="Full Name"
                />
                <Input
                  label="Relationship"
                  disabled={!isEditing}
                  value={formData.emergencyContact.relation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        relation: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Spouse, Parent"
                />
                <Input
                  label="Emergency Phone"
                  disabled={!isEditing}
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                    })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Save Bar when Editing */}
        {isEditing && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-brand-500/40 shadow-md">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              You have unsaved changes in your profile.
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Discard
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={loading}
                icon={Save}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* EMPLOYEE DOSSIER & DOCUMENTS SECTION */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Employee Compliance Dossier & Documents
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official compliance documents, appointment letters, government identity, and educational certificates.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddDocModal(true)}
          >
            Attach Document
          </Button>
        </div>

        {docLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            Loading official documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            No compliance documents attached yet. Click "Attach Document" to add appointment letter or ID proof.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {doc.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-medium px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {doc.type}
                      </span>
                      <span>•</span>
                      <span>{doc.fileSize || '1.2 MB'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      doc.status === 'Verified'
                        ? 'success'
                        : doc.status === 'Rejected'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                    dot
                  >
                    {doc.status}
                  </Badge>

                  {/* Admin verify actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                      {doc.status !== 'Verified' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc._id, 'Verified')}
                          title="Approve & Mark Verified"
                          className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {doc.status !== 'Rejected' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc._id, 'Rejected')}
                          title="Reject Document"
                          className="p-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc._id)}
                    title="Delete Document"
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AVATAR SELECTOR MODAL */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Choose Profile Picture"
        description="Select a high-resolution fictional SVG avatar from the company library"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {avatarOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAvatar(opt.uri)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 group ${
                  formData.avatar === opt.uri
                    ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-500 ring-1 ring-brand-500'
                    : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-brand-400'
                }`}
              >
                <img
                  src={opt.uri}
                  alt={opt.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {opt.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {opt.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setShowAvatarModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* ADD DOCUMENT MODAL */}
      <Modal
        isOpen={showAddDocModal}
        onClose={() => setShowAddDocModal(false)}
        title="Attach Dossier Document"
        description="Add official compliance or credential metadata to employee file"
        size="md"
      >
        <form onSubmit={handleAddDocument} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={newDoc.name}
              onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
              placeholder="e.g. Aadhaar_Government_ID.pdf"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Document Type *
            </label>
            <select
              value={newDoc.type}
              onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="Offer Letter">Offer / Appointment Letter</option>
              <option value="Government ID">Government ID (Aadhaar / PAN / Passport)</option>
              <option value="Address Proof">Address Proof / Utility Bill</option>
              <option value="Educational Certificate">Educational Degree / Certificate</option>
              <option value="Experience Certificate">Previous Experience / Relieving Letter</option>
              <option value="Tax Declaration">Tax Declaration / Form 16</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Simulated File Size
            </label>
            <input
              type="text"
              value={newDoc.fileSize}
              onChange={(e) => setNewDoc({ ...newDoc, fileSize: e.target.value })}
              placeholder="e.g. 1.5 MB"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddDocModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Check}
            >
              Attach Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
