import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Home, User, Mail, Phone, MapPin, FileText, DollarSign, AlertCircle } from "lucide-react";
import axios from "../../lib/axios.js";
import { notify } from "../../utils/toast.js";
import {  getPropertyTypes, getSubPropertyTypes, getSources, getCities, getLocations, useFetchMasters } from "../../hooks/useMastersQueries.js";

export default function AddLead() {
  const [customerType, setCustomerType] = useState("tenant");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    // tenant fields
    memberCode: "",
    customerName: "",
    mobileNumber: "",
    email: "",
    city: "",
    preferredLocation: "",
    propertyType: "",
    subPropertyType: "",
    budget: "",
    requirements: "",
    source: "",
    // owner fields
    ownerName: "",
    propertyLocation: "",
    area: "",
    landmark: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.memberCode.trim()) errs.memberCode = "Member code is required";
    if (customerType === "tenant") {
      if (!form.customerName.trim()) errs.customerName = "Customer name is required";
      if (!/^[0-9]{10}$/.test(form.mobileNumber)) errs.mobileNumber = "Mobile must be 10 digits";
      if (!form.city.trim()) errs.city = "City is required";
      if (!form.preferredLocation.trim()) errs.preferredLocation = "Preferred location required";
      if (!form.propertyType.trim()) errs.propertyType = "Property type required";
      if (!form.subPropertyType.trim()) errs.subPropertyType = "Sub-property type required";
      if (!form.source.trim()) errs.source = "Source required";
    } else {
      if (!form.ownerName.trim()) errs.ownerName = "Owner name is required";
      if (!/^[0-9]{10}$/.test(form.mobileNumber)) errs.mobileNumber = "Mobile must be 10 digits";
      if (!form.propertyLocation.trim()) errs.propertyLocation = "Property location required";
      if (!form.city.trim()) errs.city = "City is required";
      if (!form.propertyType.trim()) errs.propertyType = "Property type required";
      if (!form.subPropertyType.trim()) errs.subPropertyType = "Sub-property type required";
      if (!form.source.trim()) errs.source = "Source required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setForm({
      memberCode: "",
      customerName: "",
      mobileNumber: "",
      email: "",
      city: "",
      preferredLocation: "",
      propertyType: "",
      subPropertyType: "",
      budget: "",
      requirements: "",
      source: "",
      ownerName: "",
      propertyLocation: "",
      area: "",
      landmark: "",
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      notify.error("Please fix the errors");
      return;
    }

    const payload = {
      customerType,
      memberCode: form.memberCode,
      mobileNumber: form.mobileNumber,
      email: form.email || undefined,
      city: form.city,
      propertyType: form.propertyType,
      subPropertyType: form.subPropertyType,
      budget: form.budget || undefined,
      source: form.source,
    };

    if (customerType === "tenant") {
      payload.customerName = form.customerName;
      payload.preferredLocation = form.preferredLocation;
      payload.requirements = form.requirements || undefined;
    } else {
      payload.ownerName = form.ownerName;
      payload.propertyLocation = form.propertyLocation;
      payload.area = form.area || undefined;
      payload.landmark = form.landmark || undefined;
    }

    setLoading(true);
    try {
      const res = await axios.post("/leads/create", payload);
      notify.success(res.data?.message || "Lead created successfully");
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create lead";
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Masters (property types, sub types, sources, cities, locations)
  const { data: masters = {}, isLoading: mastersLoading } = useFetchMasters();
  const propertyTypes = getPropertyTypes(masters);
  const sources = getSources(masters);
  const cities = getCities(masters);
  const subPropertyOptions = getSubPropertyTypes(masters, form.propertyType);
  const locationOptions = getLocations(masters, form.city);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <PlusCircle className="text-green-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add Lead</h1>
            <p className="text-sm text-gray-600">Create a new tenant or owner lead</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <label className={`px-4 py-2 rounded-lg cursor-pointer ${customerType === 'tenant' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
              <input type="radio" name="type" checked={customerType === 'tenant'} onChange={() => setCustomerType('tenant')} className="mr-2" /> Tenant
            </label>
            <label className={`px-4 py-2 rounded-lg cursor-pointer ${customerType === 'owner' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
              <input type="radio" name="type" checked={customerType === 'owner'} onChange={() => setCustomerType('owner')} className="mr-2" /> Owner
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Member Code *</label>
              <input name="memberCode" value={form.memberCode} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.memberCode ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.memberCode && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.memberCode}</p>}
            </div>

            {customerType === 'tenant' ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input name="customerName" value={form.customerName} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.customerName ? 'border-red-400' : 'border-gray-300'}`} />
                  {errors.customerName && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.customerName}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} maxLength={10} className={`w-full px-3 py-2 rounded-lg border ${errors.mobileNumber ? 'border-red-400' : 'border-gray-300'}`} />
                  {errors.mobileNumber && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">City *</label>
                  <select
                    name="city"
                    value={form.city}
                    onChange={(e) => {
                      handleChange(e);
                      // clear preferred location when city changes
                      setForm((p) => ({ ...p, preferredLocation: "" }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">Select city</option>
                    {mastersLoading ? (
                      <option>Loading...</option>
                    ) : (
                      cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    )}
                  </select>
                  {errors.city && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.city}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Preferred Location *</label>
                  <select
                    name="preferredLocation"
                    value={form.preferredLocation}
                    onChange={handleChange}
                    disabled={!form.city || mastersLoading}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.preferredLocation ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">Select location</option>
                    {mastersLoading ? (
                      <option>Loading...</option>
                    ) : (
                      locationOptions.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))
                    )}
                  </select>
                  {errors.preferredLocation && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.preferredLocation}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select
                    name="propertyType"
                    value={form.propertyType}
                    onChange={(e) => {
                      handleChange(e);
                      setForm((p) => ({ ...p, subPropertyType: "" }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.propertyType ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">Select property type</option>
                    {mastersLoading ? (
                      <option>Loading...</option>
                    ) : (
                      propertyTypes.map((pt) => (
                        <option key={pt} value={pt}>{pt}</option>
                      ))
                    )}
                  </select>
                  {errors.propertyType && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.propertyType}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Sub Property Type *</label>
                  <select
                    name="subPropertyType"
                    value={form.subPropertyType}
                    onChange={handleChange}
                    disabled={!form.propertyType || mastersLoading}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.subPropertyType ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">Select sub-property type</option>
                    {mastersLoading ? (
                      <option>Loading...</option>
                    ) : (
                      subPropertyOptions.map((spt) => (
                        <option key={spt} value={spt}>{spt}</option>
                      ))
                    )}
                  </select>
                  {errors.subPropertyType && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.subPropertyType}</p>}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input name="ownerName" value={form.ownerName} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.ownerName ? 'border-red-400' : 'border-gray-300'}`} />
                  {errors.ownerName && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.ownerName}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} maxLength={10} className={`w-full px-3 py-2 rounded-lg border ${errors.mobileNumber ? 'border-red-400' : 'border-gray-300'}`} />
                  {errors.mobileNumber && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Property Location *</label>
                  <input name="propertyLocation" value={form.propertyLocation} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.propertyLocation ? 'border-red-400' : 'border-gray-300'}`} />
                  {errors.propertyLocation && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.propertyLocation}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">City *</label>
                  <select name="city" value={form.city} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.city ? 'border-red-400' : 'border-gray-300'}`} >
                  {errors.city && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.city}</p>}
                  <option value="">Select city</option>
                  {mastersLoading ? (
                    <option>Loading...</option> 
                    ) : (
                        cities.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                  <select name="propertyType" value={form.propertyType} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.propertyType ? 'border-red-400' : 'border-gray-300'}`} >
                  {errors.propertyType && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.propertyType}</p>}
                  <option value="">Select property type</option>
                  {mastersLoading ? (
                    <option>Loading...</option>
                    ) : (
                        propertyTypes.map((pt) => (
                            <option key={pt} value={pt}>{pt}</option>
                        ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Sub Property Type *</label>
                  <select name="subPropertyType" value={form.subPropertyType} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.subPropertyType ? 'border-red-400' : 'border-gray-300'}`} >
                  {errors.subPropertyType && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.subPropertyType}</p>}
                    <option value="">Select sub-property type</option>
                    {mastersLoading ? (
                        <option>Loading...</option>
                    ) : (
                        subPropertyOptions.map((spt) => (

                            <option key={spt} value={spt}>{spt}</option>
                        ))
                    )}
                  </select>
                            
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input name="budget" value={form.budget} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Source *</label>
              <select name="source" value={form.source} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.source ? 'border-red-400' : 'border-gray-300'}`} >
                <option value="">Select source</option>
                {mastersLoading ? (
                  <option>Loading...</option>
                ) : (
                  sources.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))
                )}
              </select>
              
              {errors.source && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.source}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Requirements / Notes</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300" rows={3} />
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="flex-1 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold py-3 rounded-lg shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
            <button type="button" onClick={resetForm} className="px-6 bg-gray-100 text-gray-800 rounded-lg">Clear</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
