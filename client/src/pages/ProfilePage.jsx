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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import demoAvatars from '../utils/avatars';
import api from '../api/client';
import { format } from 'date-fns';

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
    if (!window.confirm('Are you sure you want to delete this document?')) return;
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

  const avatarOptions = [
    { name: 'Ananya Sharma (Senior Engineer)', uri: demoAvatars.ananya, role: 'Engineering' },
    { name: 'Priya Iyer (HR Manager)', uri: demoAvatars.priya, role: 'Human Resources' },
    { name: 'Rohan Nair (Lead Designer)', uri: demoAvatars.rohan, role: 'UI/UX Design' },
    { name: 'Arjun Menon (Marketing Lead)', uri: demoAvatars.arjun, role: 'Marketing' },
    { name: 'Sneha Kulkarni (Finance Lead)', uri: demoAvatars.sneha, role: 'Finance' },
    { name: 'Karthik Reddy (DevOps Lead)', uri: demoAvatars.karthik, role: 'DevOps & Infra' },
  ];

  const formattedJoiningDate = user?.joiningDate
    ? format(new Date(user.joiningDate), 'MMMM dd, yyyy')
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Profile Banner / Header Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-brand-950/90 via-slate-900 to-indigo-950/80 text-white border border-slate-800 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <img
                src={
                  formData.avatar ||
                  demoAvatars.generic(user?.name?.slice(0, 2))
                }
                alt={user?.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-brand-500/50 shadow-glow"
              />
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                title="Change Profile Picture"
                className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-white cursor-pointer"
              >
                <Camera className="w-5 h-5 text-brand-300" />
                Change
              </button>
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  user?.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{user?.name}</h2>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {user?.role}
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {user?.employeeId}
                </span>
              </div>
              <p className="text-slate-300 text-sm font-medium">
                {user?.designation} • <span className="text-brand-300">{user?.department}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined on {formattedJoiningDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700"
            >
              <Camera className="w-4 h-4 text-brand-400" />
              <span>Change Photo</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all ${
                isEditing
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow'
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Leave Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Paid Leave Balance
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {user?.leaveBalance?.paid || 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Sick Leave Balance
            </span>
            <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {user?.leaveBalance?.sick || 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Total Available Leaves
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {(user?.leaveBalance?.paid || 0) + (user?.leaveBalance?.sick || 0)}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Profile Info Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal & Work Details Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-card transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              General & Work Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing || !isAdmin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">Work Email</label>
                <input
                  type="email"
                  disabled={!isEditing || !isAdmin}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">Department</label>
                <input
                  type="text"
                  disabled={!isEditing || !isAdmin}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">Designation</label>
                <input
                  type="text"
                  disabled={!isEditing || !isAdmin}
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact & Emergency Contact Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-card transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Residential & Emergency Contacts
            </h3>

            {/* Address */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">Street Address</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                  placeholder="Street / Flat / Colony"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">City</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    placeholder="Bengaluru"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">State</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">Zip Code</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.address.zip}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, zip: e.target.value },
                      })
                    }
                    placeholder="560064"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                Emergency Contact Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">Contact Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.emergencyContact.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                      })
                    }
                    placeholder="Full Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">Relationship</label>
                  <input
                    type="text"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.emergencyContact.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-brand-500/30 shadow-md">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Profile Changes
            </button>
          </div>
        )}
      </form>

      {/* EMPLOYEE DOSSIER & DOCUMENTS SECTION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              Employee Documents & Verification Dossier
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official compliance documents, appointment letters, government identity, and educational credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddDocModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/80 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Attach Document
          </button>
        </div>

        {docLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            Loading official documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            No documents attached yet. Click "Attach Document" to add appointment letter or ID proof.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-brand-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {doc.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-medium px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {doc.type}
                      </span>
                      <span>•</span>
                      <span>{doc.fileSize || '1.2 MB'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      doc.status === 'Verified'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                        : doc.status === 'Rejected'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                    }`}
                  >
                    {doc.status === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                    {doc.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                    {doc.status === 'Pending Verification' && <Clock className="w-3 h-3" />}
                    {doc.status}
                  </span>

                  {/* Admin verify actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                      {doc.status !== 'Verified' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc._id, 'Verified')}
                          title="Approve & Mark Verified"
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {doc.status !== 'Rejected' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc._id, 'Rejected')}
                          title="Reject Document"
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc._id)}
                    title="Delete Document"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
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
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose Profile Picture</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select a high-resolution local fictional SVG avatar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {avatarOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectAvatar(opt.uri)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 group ${
                    formData.avatar === opt.uri
                      ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-500 ring-2 ring-brand-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-brand-400'
                  }`}
                >
                  <img
                    src={opt.uri}
                    alt={opt.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {opt.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DOCUMENT MODAL */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attach Dossier Document</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add metadata for employee compliance file</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDocModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Type *
                </label>
                <select
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-2 shadow-glow"
                >
                  <Check className="w-4 h-4" />
                  Attach to Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
