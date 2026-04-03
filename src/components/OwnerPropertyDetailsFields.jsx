import React from "react";
import { AlertCircle } from "lucide-react";
import SearchableSelect from "./SearchableSelect";

/** Matches backend: masters value contains "commercial" (case-insensitive). */
export function isCommercialPropertyType(propertyType) {
  if (propertyType == null) return false;
  const s = String(propertyType).trim().toLowerCase();
  return s === "commercial" || s.includes("commercial");
}

/** Default form slice for owner listing / property rules (owner leads only). */
export function emptyOwnerPropertyDetails() {
  return {
    petsAllowed: "",
    parkingAvailable: "",
    securityDepositAmount: "",
    preferredTenantType: [],
    nonVegetarianAllowed: "",
    religiousConsiderations: "",
    preferredBusinessUse: "",
    propertyOccupancy: "",
    furnishingStatus: "",
    isPropertyVacant: "",
    propertyAvailableFrom: "",
  };
}

/**
 * When switching between commercial and residential property type, keep shared fields only
 * so stale segment-specific answers are not submitted.
 */
export function reconcileOwnerDetailsOnPropertyTypeChange(prevSlice, newPropertyType, oldPropertyType) {
  const wasCommercial = isCommercialPropertyType(oldPropertyType);
  const nowCommercial = isCommercialPropertyType(newPropertyType);
  if (wasCommercial === nowCommercial) return prevSlice;
  return {
    ...emptyOwnerPropertyDetails(),
    parkingAvailable: prevSlice.parkingAvailable,
    securityDepositAmount: prevSlice.securityDepositAmount,
    propertyOccupancy: prevSlice.propertyOccupancy,
    furnishingStatus: prevSlice.furnishingStatus,
    isPropertyVacant: prevSlice.isPropertyVacant,
    propertyAvailableFrom: prevSlice.propertyAvailableFrom,
  };
}

/** API boolean → select value for the form. */
export function yesNoFromApi(v) {
  if (v === true) return "yes";
  if (v === false) return "no";
  return "";
}

/** Map API / lead document to form fields. */
export function ownerPropertyDetailsFromLead(lead) {
  const o = lead?.ownerPropertyDetails;
  if (!o || typeof o !== "object") return emptyOwnerPropertyDetails();
  const from =
    o.propertyAvailableFrom != null
      ? String(o.propertyAvailableFrom).slice(0, 10)
      : "";
  let vacant = "";
  if (o.isPropertyVacant === true) vacant = "vacant";
  else if (o.isPropertyVacant === false) vacant = "not_vacant";

  return {
    petsAllowed: yesNoFromApi(o.petsAllowed),
    parkingAvailable: o.parkingAvailable ?? "",
    securityDepositAmount: o.securityDepositAmount ?? "",
    preferredTenantType: (() => {
      const v = o.preferredTenantType;
      if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
      if (typeof v === "string" && v.trim()) return [v.trim()];
      return [];
    })(),
    nonVegetarianAllowed: yesNoFromApi(o.nonVegetarianAllowed),
    religiousConsiderations: o.religiousConsiderations ?? "",
    preferredBusinessUse: o.preferredBusinessUse ?? "",
    propertyOccupancy: o.propertyOccupancy || "",
    furnishingStatus: o.furnishingStatus || "",
    isPropertyVacant: vacant,
    propertyAvailableFrom: from,
  };
}

/** Client-side validation; returns error map keyed like `ownerPropertyDetails.petsAllowed`. */
export function validateOwnerPropertyDetailsForm(slice, propertyType) {
  const commercial = isCommercialPropertyType(propertyType);
  const p = (key, msg) => ({ [`ownerPropertyDetails.${key}`]: msg });
  const e = {};
  if (!slice.parkingAvailable) Object.assign(e, p("parkingAvailable", "Required"));
  if (!String(slice.securityDepositAmount || "").trim())
    Object.assign(e, p("securityDepositAmount", "Security deposit required"));
  if (!slice.propertyOccupancy) Object.assign(e, p("propertyOccupancy", "Required"));
  if (!slice.furnishingStatus) Object.assign(e, p("furnishingStatus", "Required"));
  if (!slice.isPropertyVacant) Object.assign(e, p("isPropertyVacant", "Vacancy status required"));
  if (slice.isPropertyVacant === "not_vacant") {
    if (!String(slice.propertyAvailableFrom || "").trim())
      Object.assign(e, p("propertyAvailableFrom", "Available-from date required when not vacant"));
  }
  if (commercial) {
    if (!String(slice.preferredBusinessUse || "").trim())
      Object.assign(e, p("preferredBusinessUse", "Preferred business / use required"));
  } else {
    if (!slice.petsAllowed) Object.assign(e, p("petsAllowed", "Required"));
    const ptt = Array.isArray(slice.preferredTenantType) ? slice.preferredTenantType : [];
    if (ptt.length < 1)
      Object.assign(e, p("preferredTenantType", "Select at least one preferred tenant type"));
    if (ptt.length > 2)
      Object.assign(e, p("preferredTenantType", "Select at most 2 preferred tenant types"));
    if (!slice.nonVegetarianAllowed) Object.assign(e, p("nonVegetarianAllowed", "Required"));
    if (!String(slice.religiousConsiderations || "").trim())
      Object.assign(e, p("religiousConsiderations", "Required (e.g. None if not applicable)"));
  }
  return e;
}

/** Form "yes"/"no" select → boolean for API. */
export function yesNoToBool(v) {
  if (v === true || v === false) return v;
  if (v === "yes") return true;
  if (v === "no") return false;
  return v;
}

/** Build API object from form slice (owner leads). */
export function buildOwnerPropertyDetailsPayload(slice, propertyType) {
  const vacant = slice.isPropertyVacant === "vacant";
  const commercial = isCommercialPropertyType(propertyType);

  const base = {
    parkingAvailable: slice.parkingAvailable,
    securityDepositAmount: String(slice.securityDepositAmount || "").trim(),
    propertyOccupancy: slice.propertyOccupancy,
    furnishingStatus: slice.furnishingStatus,
    isPropertyVacant: vacant,
    propertyAvailableFrom: vacant ? null : slice.propertyAvailableFrom || null,
  };
  if (commercial) {
    return {
      ...base,
      preferredBusinessUse: String(slice.preferredBusinessUse || "").trim(),
    };
  }
  return {
    ...base,
    petsAllowed: yesNoToBool(slice.petsAllowed),
    preferredTenantType: Array.isArray(slice.preferredTenantType)
      ? slice.preferredTenantType.map((s) => String(s).trim()).filter(Boolean).slice(0, 2)
      : [],
    nonVegetarianAllowed: yesNoToBool(slice.nonVegetarianAllowed),
    religiousConsiderations: String(slice.religiousConsiderations || "").trim(),
  };
}

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

function SelectField({ label, options, error, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        {...props}
        className={`w-full px-3 py-2 rounded-lg border ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      >
        {options.map(({ value, label: l }) => (
          <option key={value || "empty"} value={value}>
            {l}
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

const YES_NO = [
  { value: "", label: "Select" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const PARKING = [
  { value: "", label: "Select" },
  { value: "none", label: "Not needed" },
  { value: "bike", label: "Bike" },
  { value: "car", label: "Car" },
  { value: "both", label: "Bike & car" },
];

const PARKING_YES_NO = [
  { value: "", label: "Select" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const PARKING_TYPE = [
  { value: "", label: "Select" },
  { value: "bike", label: "Bike only" },
  { value: "car", label: "Car only" },
  { value: "both", label: "Bike & car" },
];

const OCCUPANCY_RESIDENTIAL = [
  { value: "", label: "Select" },
  { value: "owner_occupied", label: "Owner-occupied (sharing / portion)" },
  { value: "independent", label: "Independent (full unit)" },
];

const OCCUPANCY_COMMERCIAL = [
  { value: "", label: "Select" },
  { value: "owner_occupied", label: "Shared premises / part of a complex" },
  { value: "independent", label: "Standalone / independent space" },
];

const FURNISHING = [
  { value: "", label: "Select" },
  { value: "furnished", label: "Furnished" },
  { value: "semi_furnished", label: "Semi-furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

const VACANT = [
  { value: "", label: "Select" },
  { value: "vacant", label: "Vacant now" },
  { value: "not_vacant", label: "Not vacant — available from a future date" },
];

/** Options for multi-select (max 2). Values match backend `preferredTenantType` entries. */
const PREFERRED_TENANT_BASE_OPTIONS = [
  { value: "Family", label: "Family" },
  { value: "Working professionals", label: "Working professionals" },
  { value: "Bachelors", label: "Bachelors" },
  { value: "Students", label: "Students" },
  { value: "Unmarried couple(s)", label: "Unmarried couple(s)" },
  { value: "Any / no preference", label: "Any / no preference" },
];

function preferredTenantTypeMultiOptions(selected) {
  const arr = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const inBase = new Set(PREFERRED_TENANT_BASE_OPTIONS.map((o) => o.value));
  const extras = arr
    .filter((v) => v && !inBase.has(String(v)))
    .map((v) => ({ value: String(v), label: `${v} (saved)` }));
  return [...extras, ...PREFERRED_TENANT_BASE_OPTIONS];
}

/**
 * @param {{
 *   value: ReturnType<typeof emptyOwnerPropertyDetails>,
 *   onChange: (next: ReturnType<typeof emptyOwnerPropertyDetails>) => void,
 *   errors: Record<string, string>,
 *   propertyType: string,
 * }} props
 */
export default function OwnerPropertyDetailsFields({ value, onChange, errors = {}, propertyType }) {
  const commercial = isCommercialPropertyType(propertyType);
  const err = (k) => errors[`ownerPropertyDetails.${k}`];
  const patch = (partial) => onChange({ ...value, ...partial });
  const occupancyOptions = commercial ? OCCUPANCY_COMMERCIAL : OCCUPANCY_RESIDENTIAL;
  const parkingError = err("parkingAvailable");
  const parkingChoice =
    ["bike", "car", "both"].includes(value.parkingAvailable)
      ? "yes"
      : value.parkingAvailable === "none"
        ? "no"
        : "";

  return (
    <div className="md:col-span-2 space-y-4">
      <h3 className="text-sm font-semibold text-emerald-900">Property &amp; owner preferences *</h3>
      {/* <p className="text-xs text-emerald-800/80">
        {commercial
          ? "Capture how the commercial space is offered and the intended business use."
          : "Capture how the unit is offered and tenant preferences so matches are accurate."}
      </p> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!commercial && (
          <>
            <SelectField
              label="Pets allowed *"
              options={YES_NO}
              value={value.petsAllowed}
              onChange={(e) => patch({ petsAllowed: e.target.value })}
              error={err("petsAllowed")}
            />
          </>
        )}
        <SelectField
          label="Parking available? *"
          options={PARKING_YES_NO}
          value={parkingChoice}
          onChange={(e) => {
            const choice = e.target.value;
            if (choice === "no") patch({ parkingAvailable: "none" });
            else if (choice === "yes") {
              // enum field needs a valid value; default to bike, user can change to car/both
              patch({ parkingAvailable: ["bike", "car", "both"].includes(value.parkingAvailable) ? value.parkingAvailable : "bike" });
            } else patch({ parkingAvailable: "" });
          }}
          error={parkingChoice === "" ? parkingError : undefined}
        />

        {parkingChoice === "yes" && (
          <SelectField
            label="If yes, specify parking type *"
            options={PARKING_TYPE}
            value={["bike", "car", "both"].includes(value.parkingAvailable) ? value.parkingAvailable : ""}
            onChange={(e) => patch({ parkingAvailable: e.target.value })}
            error={parkingChoice === "yes" ? parkingError : undefined}
          />
        )}
        <InputField
          label="Security deposit *"
          name="securityDepositAmount"
          value={value.securityDepositAmount}
          onChange={(e) => patch({ securityDepositAmount: e.target.value })}
          placeholder={
            commercial
              ? 'e.g. "3 months rent" or amount in ₹'
              : 'e.g. "2 months rent" or amount in ₹'
          }
          error={err("securityDepositAmount")}
        />
        {commercial ? (
          <InputField
            label="Preferred business / use *"
            name="preferredBusinessUse"
            value={value.preferredBusinessUse}
            onChange={(e) => patch({ preferredBusinessUse: e.target.value })}
            placeholder="e.g. Office, retail, F&B, warehouse, clinic, any"
            error={err("preferredBusinessUse")}
          />
        ) : (
          <div className="md:col-span-2">
            <SearchableSelect
              label="Preferred tenant type * (max 2)"
              name="preferredTenantType"
              value={Array.isArray(value.preferredTenantType) ? value.preferredTenantType : []}
              options={preferredTenantTypeMultiOptions(value.preferredTenantType)}
              onChange={(e) => patch({ preferredTenantType: e.target.value })}
              error={err("preferredTenantType")}
              placeholder="Search tenant type..."
              multi
              max={2}
            />
          </div>
        )}
        {!commercial && (
          <>
            <SelectField
              label="Non-vegetarian food allowed *"
              options={YES_NO}
              value={value.nonVegetarianAllowed}
              onChange={(e) => patch({ nonVegetarianAllowed: e.target.value })}
              error={err("nonVegetarianAllowed")}
            />
            <InputField
              label="Religious / other considerations *"
              name="religiousConsiderations"
              value={value.religiousConsiderations}
              onChange={(e) => patch({ religiousConsiderations: e.target.value })}
              placeholder='e.g. "None" or specific requests'
              error={err("religiousConsiderations")}
            />
          </>
        )}
        <SelectField
          label="Occupancy *"
          options={occupancyOptions}
          value={value.propertyOccupancy}
          onChange={(e) => patch({ propertyOccupancy: e.target.value })}
          error={err("propertyOccupancy")}
        />
        <SelectField
          label="Furnishing *"
          options={FURNISHING}
          value={value.furnishingStatus}
          onChange={(e) => patch({ furnishingStatus: e.target.value })}
          error={err("furnishingStatus")}
        />
        <SelectField
          label="Vacancy *"
          options={VACANT}
          value={value.isPropertyVacant}
          onChange={(e) =>
            patch({
              isPropertyVacant: e.target.value,
              propertyAvailableFrom: e.target.value === "vacant" ? "" : value.propertyAvailableFrom,
            })
          }
          error={err("isPropertyVacant")}
        />
        {value.isPropertyVacant === "not_vacant" && (
          <InputField
            label="Available from *"
            type="date"
            name="propertyAvailableFrom"
            value={value.propertyAvailableFrom}
            onChange={(e) => patch({ propertyAvailableFrom: e.target.value })}
            error={err("propertyAvailableFrom")}
          />
        )}
      </div>
    </div>
  );
}

/** Human-readable lines for detail views. */
export function formatOwnerPropertyDetailsForDisplay(o, propertyType) {
  if (!o || typeof o !== "object") return [];
  const commercial = isCommercialPropertyType(propertyType);
  const yesNo = (v) => (v === true ? "Yes" : v === false ? "No" : "—");
  const parkingAvailableValue = (v) => {
    if (!v) return "—";
    if (v === "none") return "No";
    if (v === "bike") return "Yes (Bike only)";
    if (v === "car") return "Yes (Car only)";
    if (v === "both") return "Yes (Bike & car)";
    return "—";
  };
  const occ =
    o.propertyOccupancy === "owner_occupied"
      ? commercial
        ? "Shared / complex"
        : "Owner-occupied"
      : o.propertyOccupancy === "independent"
        ? commercial
          ? "Standalone"
          : "Independent"
        : "—";
  const furn =
    o.furnishingStatus === "furnished"
      ? "Furnished"
      : o.furnishingStatus === "semi_furnished"
        ? "Semi-furnished"
        : o.furnishingStatus === "unfurnished"
          ? "Unfurnished"
          : "—";
  const vacant =
    o.isPropertyVacant === true ? "Yes" : o.isPropertyVacant === false ? "No (occupied)" : "—";

  const parkingRow = { label: "Parking available", value: parkingAvailableValue(o.parkingAvailable) };
  const depositRow = { label: "Security deposit", value: o.securityDepositAmount || "—" };
  const occRow = { label: "Occupancy", value: occ };
  const furnRow = { label: "Furnishing", value: furn };
  const vacantRow = { label: "Vacant now", value: vacant };

  if (commercial) {
    return [
      { label: "Preferred business / use", value: o.preferredBusinessUse || "—" },
      parkingRow,
      depositRow,
      occRow,
      furnRow,
      vacantRow,
    ];
  }
  return [
    { label: "Pets allowed", value: yesNo(o.petsAllowed) },
    parkingRow,
    depositRow,
    {
      label: "Preferred tenant type",
      value: Array.isArray(o.preferredTenantType)
        ? o.preferredTenantType.filter(Boolean).join(", ") || "—"
        : o.preferredTenantType || "—",
    },
    { label: "Non-veg allowed", value: yesNo(o.nonVegetarianAllowed) },
    { label: "Religious / other considerations", value: o.religiousConsiderations || "—" },
    occRow,
    furnRow,
    vacantRow,
  ];
}
