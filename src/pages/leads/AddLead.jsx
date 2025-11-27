// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { PlusCircle, Home, User, Mail, Phone, MapPin, FileText, DollarSign, AlertCircle } from "lucide-react";
// import axios from "../../lib/axios.js";
// import { notify } from "../../utils/toast.js";
// import {  getPropertyTypes, getSubPropertyTypes, getSources, getCities, getLocations, useFetchMasters } from "../../hooks/useMastersQueries.js";

// export default function AddLead() {
//   const [customerType, setCustomerType] = useState("tenant");
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({
//     // tenant fields
//     memberCode: "",
//     customerName: "",
//     mobileNumber: "",
//     email: "",
//     city: "",
//     preferredLocation: "",
//     propertyType: "",
//     subPropertyType: "",
//     budget: "",
//     requirements: "",
//     source: "",
//     // owner fields
//     ownerName: "",
//     propertyLocation: "",
//     area: "",
//     landmark: "",

//   });

//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//     if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
//   };

//   const validate = () => {
//     const errs = {};
//     if (!form.memberCode.trim()) errs.memberCode = "Member code is required";
//     if (customerType === "tenant") {
//       if (!form.customerName.trim()) errs.customerName = "Customer name is required";
//       if (!/^[0-9]{10}$/.test(form.mobileNumber)) errs.mobileNumber = "Mobile must be 10 digits";
//       if (!form.city.trim()) errs.city = "City is required";
//       if (!form.preferredLocation.trim()) errs.preferredLocation = "Preferred location required";
//       if (!form.propertyType.trim()) errs.propertyType = "Property type required";
//       if (!form.subPropertyType.trim()) errs.subPropertyType = "Sub-property type required";
//       if (!form.source.trim()) errs.source = "Source required";
//     } else {
//       if (!form.ownerName.trim()) errs.ownerName = "Owner name is required";
//       if (!/^[0-9]{10}$/.test(form.mobileNumber)) errs.mobileNumber = "Mobile must be 10 digits";
//       if (!form.propertyLocation.trim()) errs.propertyLocation = "Property location required";
//       if (!form.city.trim()) errs.city = "City is required";
//       if (!form.propertyType.trim()) errs.propertyType = "Property type required";
//       if (!form.subPropertyType.trim()) errs.subPropertyType = "Sub-property type required";
//       if (!form.source.trim()) errs.source = "Source required";
//     }
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const resetForm = () => {
//     setForm({
//       memberCode: "",
//       customerName: "",
//       mobileNumber: "",
//       email: "",
//       city: "",
//       preferredLocation: "",
//       propertyType: "",
//       subPropertyType: "",
//       budget: "",
//       requirements: "",
//       source: "",
//       ownerName: "",
//       propertyLocation: "",
//       area: "",
//       landmark: "",
//     });
//     setErrors({});
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) {
//       notify.error("Please fix the errors");
//       return;
//     }

//     const payload = {
//       customerType,
//       memberCode: form.memberCode,
//       mobileNumber: form.mobileNumber,
//       email: form.email || undefined,
//       city: form.city,
//       propertyType: form.propertyType,
//       subPropertyType: form.subPropertyType,
//       budget: form.budget || undefined,
//       source: form.source,
//     };

//     if (customerType === "tenant") {
//       payload.customerName = form.customerName;
//       payload.preferredLocation = form.preferredLocation;
//       payload.requirements = form.requirements || undefined;
//     } else {
//       payload.ownerName = form.ownerName;
//       payload.propertyLocation = form.propertyLocation;
//       payload.area = form.area || undefined;
//       payload.landmark = form.landmark || undefined;
//     }

//     setLoading(true);
//     try {
//       const res = await axios.post("/leads/create", payload);
//       notify.success(res.data?.message || "Lead created successfully");
//       resetForm();
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to create lead";
//       notify.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Masters (property types, sub types, sources, cities, locations)
//   const { data: masters = {}, isLoading: mastersLoading } = useFetchMasters();
//   const propertyTypes = getPropertyTypes(masters);
//   const sources = getSources(masters);
//   const cities = getCities(masters);
//   const subPropertyOptions = getSubPropertyTypes(masters, form.propertyType);
//   const locationOptions = getLocations(masters, form.city);

//   return (
//     <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//         className="max-w-4xl mx-auto"
//       >
//         <div className="mb-6 flex items-center gap-3">
//           <div className="p-3 bg-green-100 rounded-lg">
//             <PlusCircle className="text-green-600" size={28} />
//           </div>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">Add Lead</h1>
//             <p className="text-sm text-gray-600">Create a new tenant or owner lead</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
//           <div className="flex items-center gap-4">
//             <label className={`px-4 py-2 rounded-lg cursor-pointer ${customerType === 'tenant' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
//               <input type="radio" name="type" checked={customerType === 'tenant'} onChange={() => setCustomerType('tenant')} className="mr-2" /> Tenant
//             </label>
//             <label className={`px-4 py-2 rounded-lg cursor-pointer ${customerType === 'owner' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
//               <input type="radio" name="type" checked={customerType === 'owner'} onChange={() => setCustomerType('owner')} className="mr-2" /> Owner
//             </label>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1">Member Code *</label>
//               <input name="memberCode" value={form.memberCode} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.memberCode ? 'border-red-400' : 'border-gray-300'}`} />
//               {errors.memberCode && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.memberCode}</p>}
//             </div>

//             {customerType === 'tenant' ? (
//               <>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
//                   <input name="customerName" value={form.customerName} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.customerName ? 'border-red-400' : 'border-gray-300'}`} />
//                   {errors.customerName && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.customerName}</p>}
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
//                   <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} maxLength={10} className={`w-full px-3 py-2 rounded-lg border ${errors.mobileNumber ? 'border-red-400' : 'border-gray-300'}`} />
//                   {errors.mobileNumber && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.mobileNumber}</p>}
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
//                   <input name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">City *</label>
//                   <select
//                     name="city"
//                     value={form.city}
//                     onChange={(e) => {
//                       handleChange(e);
//                       // clear preferred location when city changes
//                       setForm((p) => ({ ...p, preferredLocation: "" }));
//                     }}
//                     className={`w-full px-3 py-2 rounded-lg border ${errors.city ? 'border-red-400' : 'border-gray-300'}`}
//                   >
//                     <option value="">Select city</option>
//                     {mastersLoading ? (
//                       <option>Loading...</option>
//                     ) : (
//                       cities.map((c) => (
//                         <option key={c} value={c}>{c}</option>
//                       ))
//                     )}
//                   </select>
//                   {errors.city && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.city}</p>}
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Preferred Location *</label>
//                   <select
//                     name="preferredLocation"
//                     value={form.preferredLocation}
//                     onChange={handleChange}
//                     disabled={!form.city || mastersLoading}
//                     className={`w-full px-3 py-2 rounded-lg border ${errors.preferredLocation ? 'border-red-400' : 'border-gray-300'}`}
//                   >
//                     <option value="">Select location</option>
//                     {mastersLoading ? (
//                       <option>Loading...</option>
//                     ) : (
//                       locationOptions.map((loc) => (
//                         <option key={loc} value={loc}>{loc}</option>
//                       ))
//                     )}
//                   </select>
//                   {errors.preferredLocation && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.preferredLocation}</p>}
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Property Type *</label>
//                   <select
//                     name="propertyType"
//                     value={form.propertyType}
//                     onChange={(e) => {
//                       handleChange(e);
//                       setForm((p) => ({ ...p, subPropertyType: "" }));
//                     }}
//                     className={`w-full px-3 py-2 rounded-lg border ${errors.propertyType ? 'border-red-400' : 'border-gray-300'}`}
//                   >
//                     <option value="">Select property type</option>
//                     {mastersLoading ? (
//                       <option>Loading...</option>
//                     ) : (
//                       propertyTypes.map((pt) => (
//                         <option key={pt} value={pt}>{pt}</option>
//                       ))
//                     )}
//                   </select>
//                   {errors.propertyType && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.propertyType}</p>}
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Sub Property Type *</label>
//                   <select
//                     name="subPropertyType"
//                     value={form.subPropertyType}
//                     onChange={handleChange}
//                     disabled={!form.propertyType || mastersLoading}
//                     className={`w-full px-3 py-2 rounded-lg border ${errors.subPropertyType ? 'border-red-400' : 'border-gray-300'}`}
//                   >
//                     <option value="">Select sub-property type</option>
//                     {mastersLoading ? (
//                       <option>Loading...</option>
//                     ) : (
//                       subPropertyOptions.map((spt) => (
//                         <option key={spt} value={spt}>{spt}</option>
//                       ))
//                     )}
//                   </select>
//                   {errors.subPropertyType && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.subPropertyType}</p>}
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
//                   <input name="ownerName" value={form.ownerName} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.ownerName ? 'border-red-400' : 'border-gray-300'}`} />
//                   {errors.ownerName && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.ownerName}</p>}
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
//                   <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} maxLength={10} className={`w-full px-3 py-2 rounded-lg border ${errors.mobileNumber ? 'border-red-400' : 'border-gray-300'}`} />
//                   {errors.mobileNumber && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.mobileNumber}</p>}
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
//                   <input name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Property Location *</label>
//                   <input name="propertyLocation" value={form.propertyLocation} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.propertyLocation ? 'border-red-400' : 'border-gray-300'}`} />
//                   {errors.propertyLocation && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.propertyLocation}</p>}
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">City *</label>
//                   <select name="city" value={form.city} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.city ? 'border-red-400' : 'border-gray-300'}`} >
//                   {errors.city && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.city}</p>}
//                   <option value="">Select city</option>
//                   {mastersLoading ? (
//                     <option>Loading...</option> 
//                     ) : (
//                         cities.map((c) => (
//                             <option key={c} value={c}>{c}</option>
//                         ))
//                     )}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Property Type *</label>
//                   <select name="propertyType" value={form.propertyType} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.propertyType ? 'border-red-400' : 'border-gray-300'}`} >
//                   {errors.propertyType && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.propertyType}</p>}
//                   <option value="">Select property type</option>
//                   {mastersLoading ? (
//                     <option>Loading...</option>
//                     ) : (
//                         propertyTypes.map((pt) => (
//                             <option key={pt} value={pt}>{pt}</option>
//                         ))
//                     )}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-gray-700 mb-1">Sub Property Type *</label>
//                   <select name="subPropertyType" value={form.subPropertyType} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.subPropertyType ? 'border-red-400' : 'border-gray-300'}`} >
//                   {errors.subPropertyType && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.subPropertyType}</p>}
//                     <option value="">Select sub-property type</option>
//                     {mastersLoading ? (
//                         <option>Loading...</option>
//                     ) : (
//                         subPropertyOptions.map((spt) => (

//                             <option key={spt} value={spt}>{spt}</option>
//                         ))
//                     )}
//                   </select>
                            
//                 </div>
//               </>
//             )}

//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1">Budget</label>
//               <input name="budget" value={form.budget} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300" />
//             </div>

//             <div>
//               <label className="text-sm font-medium text-gray-700 mb-1">Source *</label>
//               <select name="source" value={form.source} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg border ${errors.source ? 'border-red-400' : 'border-gray-300'}`} >
//                 <option value="">Select source</option>
//                 {mastersLoading ? (
//                   <option>Loading...</option>
//                 ) : (
//                   sources.map((src) => (
//                     <option key={src} value={src}>{src}</option>
//                   ))
//                 )}
//               </select>
              
//               {errors.source && <p className="text-red-500 text-sm mt-1"><AlertCircle size={14} /> {errors.source}</p>}
//             </div>

//             <div className="md:col-span-2">
//               <label className="text-sm font-medium text-gray-700 mb-1">Requirements / Notes</label>
//               <textarea name="requirements" value={form.requirements} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300" rows={3} />
//             </div>
//           </div>

//           <div className="flex gap-4">
//             <button type="submit" disabled={loading} className="flex-1 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold py-3 rounded-lg shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
//               {loading ? 'Creating...' : 'Create Lead'}
//             </button>
//             <button type="button" onClick={resetForm} className="px-6 bg-gray-100 text-gray-800 rounded-lg">Clear</button>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, AlertCircle } from "lucide-react";
import { notify } from "../../utils/toast";
import { useCreateLead } from "../../hooks/useLeadQueries";
import {
  useFetchMasters,
  getPropertyTypes,
  getSubPropertyTypes,
  getCities,
  getSources,
  getLocations,
} from "../../hooks/useMastersQueries";

export default function AddLead() {
  const [customerType, setCustomerType] = useState("tenant");

  const [form, setForm] = useState({
    memberCode: "",
    customerName: "",
    ownerName: "",
    mobileNumber: "",
    email: "",
    city: "",
    preferredLocation: "",
    propertyLocation: "",
    propertyType: "",
    subPropertyType: "",
    budget: "",
    source: "",
    requirements: "",
    area: "",
    landmark: "",
  });

  const [errors, setErrors] = useState({});

  // ======================
  // Masters
  // ======================
  const { data: masters = {}, isLoading: mastersLoading } = useFetchMasters();

  const cities = getCities(masters);
  const propertyTypes = getPropertyTypes(masters);
  const subPropertyOptions = getSubPropertyTypes(masters, form.propertyType);
  const sources = getSources(masters);
  const locationOptions = getLocations(masters, form.city);

  // ======================
  // React Query Mutation
  // ======================
  const createLead = useCreateLead();

  // ======================
  // Validation
  // ======================
  const validate = () => {
    const e = {};

    if (!form.memberCode.trim()) e.memberCode = "Member code required";
    if (!/^[0-9]{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Mobile must be 10 digits";

    if (!form.city) e.city = "City required";
    if (!form.propertyType) e.propertyType = "Property type required";
    if (!form.subPropertyType) e.subPropertyType = "Sub property required";
    if (!form.source) e.source = "Source required";

    if (customerType === "tenant") {
      if (!form.customerName.trim()) e.customerName = "Customer name required";
      if (!form.preferredLocation)
        e.preferredLocation = "Preferred location required";
    } else {
      if (!form.ownerName.trim()) e.ownerName = "Owner name required";
      if (!form.propertyLocation)
        e.propertyLocation = "Property location required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ======================
  // Submit
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      notify.error("Fix validation errors");
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
      requirements: form.requirements || undefined,
    };

    if (customerType === "tenant") {
      payload.customerName = form.customerName;
      payload.preferredLocation = form.preferredLocation;
    } else {
      payload.ownerName = form.ownerName;
      payload.propertyLocation = form.propertyLocation;
      payload.area = form.area || undefined;
      payload.landmark = form.landmark || undefined;
    }

    createLead.mutate(payload, {
      onSuccess: () => {
        notify.success("Lead created successfully");
        resetForm();
      },
      onError: (err) =>
        notify.error(err.response?.data?.message || "Failed to create lead"),
    });
  };

  const resetForm = () => {
    setForm({
      memberCode: "",
      customerName: "",
      ownerName: "",
      mobileNumber: "",
      email: "",
      city: "",
      preferredLocation: "",
      propertyLocation: "",
      propertyType: "",
      subPropertyType: "",
      budget: "",
      source: "",
      requirements: "",
      area: "",
      landmark: "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <PlusCircle className="text-green-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add Lead</h1>
            <p className="text-sm text-gray-600">
              Create a new tenant or owner lead
            </p>
          </div>
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm border space-y-6"
        >
          {/* TYPE TOGGLE */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCustomerType("tenant")}
              className={`px-4 py-2 rounded-lg ${
                customerType === "tenant"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Tenant
            </button>

            <button
              type="button"
              onClick={() => setCustomerType("owner")}
              className={`px-4 py-2 rounded-lg ${
                customerType === "owner"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              Owner
            </button>
          </div>

          {/* FIELDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Code */}
            <InputField
              label="Member Code *"
              name="memberCode"
              value={form.memberCode}
              onChange={handleChange}
              error={errors.memberCode}
            />

            {/* TENANT FIELDS */}
            {customerType === "tenant" && (
              <>
                <InputField
                  label="Customer Name *"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  error={errors.customerName}
                />

                <InputField
                  label="Mobile Number *"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  maxLength={10}
                  onChange={handleChange}
                  error={errors.mobileNumber}
                />

                <InputField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />

                {/* City */}
                <SelectField
                  label="City *"
                  name="city"
                  value={form.city}
                  options={cities}
                  onChange={(e) => {
                    handleChange(e);
                    setForm((p) => ({ ...p, preferredLocation: "" }));
                  }}
                  error={errors.city}
                />

                {/* Preferred Location */}
                <SelectField
                  label="Preferred Location *"
                  name="preferredLocation"
                  value={form.preferredLocation}
                  options={locationOptions}
                  disabled={!form.city}
                  onChange={handleChange}
                  error={errors.preferredLocation}
                />

                {/* Property Type */}
                <SelectField
                  label="Property Type *"
                  name="propertyType"
                  value={form.propertyType}
                  options={propertyTypes}
                  onChange={(e) => {
                    handleChange(e);
                    setForm((p) => ({ ...p, subPropertyType: "" }));
                  }}
                  error={errors.propertyType}
                />

                {/* Sub Property */}
                <SelectField
                  label="Sub Property Type *"
                  name="subPropertyType"
                  value={form.subPropertyType}
                  options={subPropertyOptions}
                  disabled={!form.propertyType}
                  onChange={handleChange}
                  error={errors.subPropertyType}
                />
              </>
            )}

            {/* OWNER FIELDS */}
            {customerType === "owner" && (
              <>
                <InputField
                  label="Owner Name *"
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  error={errors.ownerName}
                />

                <InputField
                  label="Mobile Number *"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  maxLength={10}
                  onChange={handleChange}
                  error={errors.mobileNumber}
                />

                <InputField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />

                <InputField
                  label="Property Location *"
                  name="propertyLocation"
                  value={form.propertyLocation}
                  onChange={handleChange}
                  error={errors.propertyLocation}
                />

                <SelectField
                  label="City *"
                  name="city"
                  value={form.city}
                  options={cities}
                  onChange={handleChange}
                  error={errors.city}
                />

                <SelectField
                  label="Property Type *"
                  name="propertyType"
                  value={form.propertyType}
                  options={propertyTypes}
                  onChange={handleChange}
                  error={errors.propertyType}
                />

                <SelectField
                  label="Sub Property Type *"
                  name="subPropertyType"
                  value={form.subPropertyType}
                  options={subPropertyOptions}
                  disabled={!form.propertyType}
                  onChange={handleChange}
                  error={errors.subPropertyType}
                />

                <InputField
                  label="Area"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                />

                <InputField
                  label="Landmark"
                  name="landmark"
                  value={form.landmark}
                  onChange={handleChange}
                />
              </>
            )}

            {/* COMMON FIELDS */}
            <InputField
              label="Budget"
              name="budget"
              value={form.budget}
              onChange={handleChange}
            />

            <SelectField
              label="Source *"
              name="source"
              value={form.source}
              options={sources}
              onChange={handleChange}
              error={errors.source}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Requirements / Notes
              </label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={createLead.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {createLead.isPending ? "Submitting..." : "Create Lead"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* -------------------------------------
   REUSABLE INPUT COMPONENT
--------------------------------------*/
function InputField({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-lg border ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------
   REUSABLE SELECT COMPONENT
--------------------------------------*/
function SelectField({ label, options = [], error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        {...props}
        className={`w-full px-3 py-2 rounded-lg border ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}
