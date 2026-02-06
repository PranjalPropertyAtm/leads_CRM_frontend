


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
import { useFetchEmployees } from "../../hooks/useEmployeeQueries";
import SearchableSelect from "../../components/SearchableSelect";


export default function AddLead() {
  const [customerType, setCustomerType] = useState("tenant");

  const [form, setForm] = useState({
    // memberCode: "",
    customerName: "",
    ownerName: "",
    mobileNumber: "",
    email: "",
    city: "",
    // support multiple preferred locations
    preferredLocation: [],
    propertyLocation: "",
    propertyType: "",
    subPropertyType: "",
    budget: "",
    source: "",
    assignedTo: "",
    requirements: "",
    area: "",
    landmark: "",
    requirementDurationValue: 30,
    requirementDurationUnit: "days",
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

  const { data } = useFetchEmployees(1, 1000); // fetch all employees
  const employees = data?.employees || [];

  const employeeOptions = employees.map((emp) => ({
    value: emp._id,
    label: `${emp.name} (${emp.designation || ""})`
  }));


  // ======================
  // React Query Mutation
  // ======================
  const createLead = useCreateLead();

  // ======================
  // Validation
  // ======================
  const validate = () => {
    const e = {};

    // if (!form.memberCode.trim()) e.memberCode = "Member code required";
    if (!/^[0-9]{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Mobile must be 10 digits";

    if (!form.city) e.city = "City required";
    if (!form.propertyType) e.propertyType = "Property type required";
    if (!form.subPropertyType) e.subPropertyType = "Sub property required";
    if (!form.source) e.source = "Source required";

    if (customerType === "tenant") {
      if (!form.customerName.trim()) e.customerName = "Customer name required";
      if (!Array.isArray(form.preferredLocation) || form.preferredLocation.length === 0)
        e.preferredLocation = "Preferred location required";
      else if (Array.isArray(form.preferredLocation) && form.preferredLocation.length > 3)
        e.preferredLocation = "Select at most 3 preferred locations";
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
      // memberCode: form.memberCode,
      mobileNumber: form.mobileNumber,
      email: form.email || undefined,
      city: form.city,
      propertyType: form.propertyType,
      subPropertyType: form.subPropertyType,
      budget: form.budget || undefined,
      source: form.source,
      assignedTo:form.assignedTo || undefined,
      requirements: form.requirements || undefined,
      area: form.area || undefined,
      landmark: form.landmark || undefined,
      requirementDuration: {
        value: Number(form.requirementDurationValue) || 30,
        unit: form.requirementDurationUnit || "days",
      },
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
      // memberCode: "",
      customerName: "",
      ownerName: "",
      mobileNumber: "",
      email: "",
      city: "",
      preferredLocation: [],
      propertyLocation: "",
      propertyType: "",
      subPropertyType: "",
      budget: "",
      source: "",
      assignedTo: "",
      requirements: "",
      area: "",
      landmark: "",
      requirementDurationValue: 30,
      requirementDurationUnit: "days",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    // For budget, allow only numeric digits (no currency symbols or letters)
    if (name === "budget") {
      value = value.replace(/\D/g, "");
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="bg-slate-100 p-6">
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
              className={`px-4 py-2 rounded-lg ${customerType === "tenant"
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
                }`}
            >
              Tenant
            </button>

            <button
              type="button"
              onClick={() => setCustomerType("owner")}
              className={`px-4 py-2 rounded-lg ${customerType === "owner"
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
            {/* <InputField
              label="Member Code *"
              name="memberCode"
              value={form.memberCode}
              onChange={handleChange}
              error={errors.memberCode}
            /> */}

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
                    setForm((p) => ({ ...p, preferredLocation: [] }));
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
                  onChange={handleChange}
                  error={errors.preferredLocation}
                  placeholder="Search location..."
                  multi
                  max={3}
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
                  type="number"
                  min="0"
                  step="any"
                  suffix="sq ft"
                  placeholder="e.g., 1200"
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
            {/* <InputField
              label="Budget"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              inputMode="numeric"
              pattern="\\d*"
              placeholder="Enter amount (numbers only)"
            /> */}


            
<InputField
  label="Budget"
  name="budget"
  value={form.budget}
  onChange={handleChange}
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Enter amount (numbers only)"
  onKeyPress={(e) => {
    // Prevent non-numeric characters from being typed
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }}
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

            {/* Requirement Duration */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Requirement Duration</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  name="requirementDurationValue"
                  value={form.requirementDurationValue}
                  onChange={handleChange}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-300"
                />
                <select
                  name="requirementDurationUnit"
                  value={form.requirementDurationUnit}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">Expected closure timeline from lead creation</p>
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
function InputField({ label, error, suffix, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          {...props}
          className={`w-full ${suffix ? 'pr-14' : ''} px-3 py-2 rounded-lg border ${error ? "border-red-400" : "border-gray-300"}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{suffix}</div>
        )}
      </div>
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
        className={`w-full px-3 py-2 rounded-lg border ${error ? "border-red-400" : "border-gray-300"
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
