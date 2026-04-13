import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getUserAddresses, createAddress, updateAddress, deleteAddress } from '../../api/endpoints';
import { MapPin, Mail, Phone, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const emptyForm = {
    addressLine1: '',
    addressLine2: '',
    phone: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await getUserAddresses();
      setAddresses(response.data || []);
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
        toast.success('Address updated successfully');
      } else {
        await createAddress(formData);
        toast.success('Address added successfully');
      }
      setFormData(emptyForm);
      setEditingAddress(null);
      setShowAddressForm(false);
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
        toast.success('Address deleted');
        fetchAddresses();
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      phone: address.phone || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      isDefault: address.isDefault || false
    });
    setShowAddressForm(true);
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm">Full Name</label>
                <p className="text-lg font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm flex items-center space-x-2">
                  <Mail size={16} /> <span>Email</span>
                </label>
                <p className="text-lg font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm flex items-center space-x-2">
                  <Phone size={16} /> <span>Phone</span>
                </label>
                <p className="text-lg font-medium">{user?.phone}</p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Account Role</label>
                <p className="text-lg font-medium">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {user?.role}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600 text-sm">Status</label>
                <p className={`text-lg font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <label className="text-gray-600 text-sm">Member Since</label>
                <p className="text-lg font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Saved Addresses</h2>
          {!showAddressForm && (
            <button
              onClick={() => {
                setShowAddressForm(true);
                setEditingAddress(null);
                setFormData(emptyForm);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Add New Address
            </button>
          )}
        </div>

        {/* Address Form */}
        {showAddressForm && (
          <form onSubmit={handleAddressSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Address Line 1 *"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                required
                className="col-span-2 border rounded px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Address Line 2 (Apt, Suite, etc.)"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                className="col-span-2 border rounded px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="City *"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="State *"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Postal Code *"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Country *"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                <span>Set as default address</span>
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddressForm(false);
                  setEditingAddress(null);
                }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Address List */}
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <p className="col-span-2 text-gray-600 text-center py-8">No addresses saved yet.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin size={20} className="text-green-600" />
                    <h3 className="font-semibold">{address.addressLine1}</h3>
                  </div>
                  {address.isDefault && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      Default
                    </span>
                  )}
                </div>
                {address.addressLine2 && (
                  <p className="text-gray-600 text-sm mb-1">{address.addressLine2}</p>
                )}
                <p className="text-gray-600 text-sm mb-1">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-gray-600 text-sm mb-1">{address.country}</p>
                <p className="text-gray-600 text-sm mb-4">Phone: {address.phone}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
