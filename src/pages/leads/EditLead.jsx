import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Edit as EditIcon, AlertCircle, ArrowLeft } from "lucide-react";
import { notify } from "../../utils/toast";
import { useUpdateLead } from "../../hooks/useLeadQueries";
import { useQuery } from "@tanstack/react-query";
import axios from "../../lib/axios";
import {
  useFetchMasters,
  getPropertyTypes,
  getSubPropertyTypes,
  getCities,
  getSources,
  getLocations,
} from "../../hooks/useMastersQueries";
import { useFetchEmployees } from "../../hooks/useEmployeeQueries";
import SearchableSelect from "../../components/SearchableSelect";

export default function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState("tenant");

  const [form, setForm] = useState({
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
    assignedTo: "",
    requirements: "",
    area: "",
    landmark: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch lead data
  const { data: leadData, isLoading: leadLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const response = await axios.get(`/leads/${id}`);
      if (!response.data.success || !response.data.data) {
        throw new Error("Lead not found");
      }
      return response.data.data;
    },
    enabled: !!id,
  });

  // Update form when lead data is loaded
  useEffect(() => {
    if (leadData) {
      setCustomerType(leadData.customerType || "tenant");
      setForm({
        customerName: leadData.customerName || "",
        ownerName: leadData.ownerName || "",
        mobileNumber: leadData.mobileNumber || "",
        email: leadData.email || "",
        city: leadData.city || "",
        preferredLocation: leadData.preferredLocation || "",
        propertyLocation: leadData.propertyLocation || "",
        propertyType: leadData.propertyType || "",
        subPropertyType: leadData.subPropertyType || "",
        budget: leadData.budget || "",
        source: leadData.source || "",
        assignedTo: leadData.assignedTo?._id || leadData.assignedTo || "",
        requirements: leadData.requirements || "",
        area: leadData.area || "",
        landmark: leadData.landmark || "",
      });
      setErrors({});
    }
  }, [leadData]);

  // Masters
  const { data: masters = {}, isLoading: mastersLoading } = useFetchMasters();
  const cities = getCities(masters);
  const propertyTypes = getPropertyTypes(masters);
  const subPropertyOptions = getSubPropertyTypes(masters, form.propertyType);
  const sources = getSources(masters);
  const locationOptions = getLocations(masters, form.city);

  const { data } = useFetchEmployees(1, 1000);
  const employees = data?.employees || [];
  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name} (${emp.designation || ""})`,
  }));

  const updateLead = useUpdateLead();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      notify.error("Fix validation errors");
      return;
    }

    const payload = {
      customerType,
      mobileNumber: form.mobileNumber,
      email: form.email || undefined,
      city: form.city,
      propertyType: form.propertyType,
      subPropertyType: form.subPropertyType,
      budget: form.budget || undefined,
      source: form.source,
      assignedTo: form.assignedTo || undefined,
      requirements: form.requirements || undefined,
      area: form.area || undefined,
      landmark: form.landmark || undefined,
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

    updateLead.mutate(
      { id, updateData: payload },
      {
        onSuccess: () => {
          notify.success("Lead updated successfully");
          navigate(-1); // Go back to previous page
        },
        onError: (err) =>
          notify.error(err.response?.data?.message || "Failed to update lead"),
      }
    );
  };

  const resetForm = () => {
    if (leadData) {
      setCustomerType(leadData.customerType || "tenant");
      setForm({
        customerName: leadData.customerName || "",
        ownerName: leadData.ownerName || "",
        mobileNumber: leadData.mobileNumber || "",
        email: leadData.email || "",
        city: leadData.city || "",
        preferredLocation: leadData.preferredLocation || "",
        propertyLocation: leadData.propertyLocation || "",
        propertyType: leadData.propertyType || "",
        subPropertyType: leadData.subPropertyType || "",
        budget: leadData.budget || "",
        source: leadData.source || "",
        assignedTo: leadData.assignedTo?._id || leadData.assignedTo || "",
        requirements: leadData.requirements || "",
        area: leadData.area || "",
        landmark: leadData.landmark || "",
      });
      setErrors({});
    }
  };

  if (leadLoading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead data...</p>
        </div>
      </div>
    );
  }

  if (!leadData) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lead not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div className="p-3 bg-blue-100 rounded-lg">
            <EditIcon className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Edit Lead</h1>
            <p className="text-sm text-gray-600">
              Update tenant or owner lead information
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
                <SearchableSelect
                  label="Preferred Location *"
                  name="preferredLocation"
                  value={form.preferredLocation}
                  options={locationOptions.map((l) => ({ value: l, label: l }))}
                  disabled={!form.city}
                  onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.value } })}
                  error={errors.preferredLocation}
                  placeholder="Search location..."
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

            <SearchableSelect
              label="Assigned To"
              value={form.assignedTo}
              options={employeeOptions}
              onChange={handleChange}
              error={errors.assignedTo}
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
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={updateLead.isPending}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {updateLead.isPending ? "Updating..." : "Update Lead"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
            >
              Reset
            </button>
          </div>
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

