import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { useUpdateLead } from "../hooks/useLeadQueries";
import { useFetchMasters, getPropertyTypes, getSubPropertyTypes, getCities, getSources, getLocations } from "../hooks/useMastersQueries";
import { useFetchEmployees } from "../hooks/useEmployeeQueries";
import SearchableSelect from "./SearchableSelect";
import { notify } from "../utils/toast";

export default function EditLeadModal({ open, onClose, lead }) {
  const [customerType, setCustomerType] = useState(lead?.customerType || "tenant");
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

  // Masters
  const { data: masters = {}, isLoading: mastersLoading } = useFetchMasters();
  const cities = getCities(masters);
  const propertyTypes = getPropertyTypes(masters);
  const subPropertyOptions = getSubPropertyTypes(masters, form.propertyType);
  const sources = getSources(masters);
  const locationOptions = getLocations(masters, form.city);

  // Employees
  const { data } = useFetchEmployees(1, 1000);
  const employees = data?.employees || [];
  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name} (${emp.designation || ""})`,
  }));

  // Update form when lead changes
  useEffect(() => {
    if (lead) {
      setCustomerType(lead.customerType || "tenant");
      setForm({
        customerName: lead.customerName || "",
        ownerName: lead.ownerName || "",
        mobileNumber: lead.mobileNumber || "",
        email: lead.email || "",
        city: lead.city || "",
        preferredLocation: lead.preferredLocation || "",
        propertyLocation: lead.propertyLocation || "",
        propertyType: lead.propertyType || "",
        subPropertyType: lead.subPropertyType || "",
        budget: lead.budget || "",
        source: lead.source || "",
        assignedTo: lead.assignedTo?._id || lead.assignedTo || "",
        requirements: lead.requirements || "",
        area: lead.area || "",
        landmark: lead.landmark || "",
      });
      setErrors({});
    }
  }, [lead]);

  const updateLead = useUpdateLead();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!/^[0-9]{10}$/.test(form.mobileNumber)) {
      e.mobileNumber = "Mobile must be 10 digits";
    }
    if (!form.city) e.city = "City required";
    if (!form.propertyType) e.propertyType = "Property type required";
    if (!form.subPropertyType) e.subPropertyType = "Sub property required";
    if (!form.source) e.source = "Source required";

    if (customerType === "tenant") {
      if (!form.customerName.trim()) e.customerName = "Customer name required";
      if (!form.preferredLocation) e.preferredLocation = "Preferred location required";
    } else {
      if (!form.ownerName.trim()) e.ownerName = "Owner name required";
      if (!form.propertyLocation) e.propertyLocation = "Property location required";
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
      { id: lead._id, updateData: payload },
      {
        onSuccess: () => {
          notify.success("Lead updated successfully");
          onClose();
        },
        onError: (err) => {
          notify.error(err.response?.data?.message || "Failed to update lead");
        },
      }
    );
  };

  if (!open || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Edit Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Toggle */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCustomerType("tenant")}
              className={`px-4 py-2 rounded-lg ${customerType === "tenant" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              Tenant
            </button>
            <button
              type="button"
              onClick={() => setCustomerType("owner")}
              className={`px-4 py-2 rounded-lg ${customerType === "owner" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              Owner
            </button>
          </div>

          {/* Fields Grid */}
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
              <SearchableSelect
                label="Assigned To"
                value={form.assignedTo}
                options={employeeOptions}
                onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
              />
            </div>
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

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateLead.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {updateLead.isPending ? "Updating..." : "Update Lead"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function InputField({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-lg border ${error ? "border-red-400" : "border-gray-300"}`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}

function SelectField({ label, options = [], error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        {...props}
        className={`w-full px-3 py-2 rounded-lg border ${error ? "border-red-400" : "border-gray-300"}`}
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

