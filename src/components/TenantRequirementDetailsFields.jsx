import React from "react";
import { AlertCircle } from "lucide-react";
import {
  isCommercialPropertyType,
  yesNoFromApi,
  yesNoToBool,
} from "./OwnerPropertyDetailsFields";

export function emptyTenantRequirementDetails() {
  return {
    furnishingPreference: "",
    furnishingOtherNote: "",
    occupation: "",
    hasPets: "",
    parkingNeeded: "",
    floorPreference: "",
    numberOfPeople: "",
    householdType: "",
    householdOtherNote: "",
    intendedCommercialUse: "",
  };
}

/**
 * When switching between commercial and residential property type, keep shared fields only.
 */
export function reconcileTenantDetailsOnPropertyTypeChange(
  prevSlice,
  newPropertyType,
  oldPropertyType
) {
  const wasCommercial = isCommercialPropertyType(oldPropertyType);
  const nowCommercial = isCommercialPropertyType(newPropertyType);
  if (wasCommercial === nowCommercial) return prevSlice;
  return {
    ...emptyTenantRequirementDetails(),
    furnishingPreference: prevSlice.furnishingPreference,
    furnishingOtherNote: prevSlice.furnishingOtherNote,
    parkingNeeded: prevSlice.parkingNeeded,
    floorPreference: prevSlice.floorPreference,
    numberOfPeople: prevSlice.numberOfPeople,
  };
}

export function tenantRequirementDetailsFromLead(lead) {
  const t = lead?.tenantRequirementDetails;
  if (!t || typeof t !== "object") return emptyTenantRequirementDetails();
  return {
    furnishingPreference: t.furnishingPreference || "",
    furnishingOtherNote: t.furnishingOtherNote ?? "",
    occupation: t.occupation ?? "",
    hasPets: yesNoFromApi(t.hasPets),
    parkingNeeded: t.parkingNeeded || "",
    floorPreference: t.floorPreference ?? "",
    numberOfPeople: t.numberOfPeople != null ? String(t.numberOfPeople) : "",
    householdType: t.householdType || "",
    householdOtherNote: t.householdOtherNote ?? "",
    intendedCommercialUse: t.intendedCommercialUse ?? "",
  };
}

export function validateTenantRequirementDetailsForm(slice, propertyType) {
  const commercial = isCommercialPropertyType(propertyType);
  const p = (key, msg) => ({ [`tenantRequirementDetails.${key}`]: msg });
  const e = {};
  const num = parseInt(String(slice.numberOfPeople ?? "").trim(), 10);
  if (Number.isNaN(num) || num < 1 || num > 99) {
    Object.assign(
      e,
      p(
        "numberOfPeople",
        commercial ? "Enter team size (1–99)" : "Enter number of people (1–99)"
      )
    );
  }
  if (!slice.furnishingPreference)
    Object.assign(e, p("furnishingPreference", "Furnishing preference required"));
  if (slice.furnishingPreference === "other") {
    if (!String(slice.furnishingOtherNote || "").trim())
      Object.assign(e, p("furnishingOtherNote", "Please describe (Other)"));
  }
  if (!slice.parkingNeeded) Object.assign(e, p("parkingNeeded", "Parking requirement required"));
  if (!String(slice.floorPreference || "").trim())
    Object.assign(e, p("floorPreference", "Floor preference required"));

  if (commercial) {
    if (!String(slice.intendedCommercialUse || "").trim())
      Object.assign(e, p("intendedCommercialUse", "Intended business / use required"));
  } else {
    if (!slice.householdType) Object.assign(e, p("householdType", "Household type required"));
    if (slice.householdType === "other") {
      if (!String(slice.householdOtherNote || "").trim())
        Object.assign(e, p("householdOtherNote", "Please describe (Other)"));
    }
    if (!String(slice.occupation || "").trim())
      Object.assign(e, p("occupation", "Occupation / what they do is required"));
    if (!slice.hasPets) Object.assign(e, p("hasPets", "Required"));
  }
  return e;
}

export function buildTenantRequirementDetailsPayload(slice, propertyType) {
  const commercial = isCommercialPropertyType(propertyType);
  const isOtherFurn = slice.furnishingPreference === "other";
  const num = parseInt(String(slice.numberOfPeople ?? "").trim(), 10);
  const base = {
    furnishingPreference: slice.furnishingPreference,
    furnishingOtherNote: isOtherFurn ? String(slice.furnishingOtherNote || "").trim() : "",
    parkingNeeded: slice.parkingNeeded,
    floorPreference: String(slice.floorPreference || "").trim(),
    numberOfPeople: num,
  };
  if (commercial) {
    return {
      ...base,
      intendedCommercialUse: String(slice.intendedCommercialUse || "").trim(),
      occupation: "",
      hasPets: false,
    };
  }
  const isOtherHousehold = slice.householdType === "other";
  return {
    ...base,
    occupation: String(slice.occupation || "").trim(),
    hasPets: yesNoToBool(slice.hasPets),
    householdType: slice.householdType,
    householdOtherNote: isOtherHousehold
      ? String(slice.householdOtherNote || "").trim()
      : "",
    intendedCommercialUse: "",
  };
}

const FURNISHING = [
  { value: "", label: "Select" },
  { value: "furnished", label: "Furnished" },
  { value: "semi_furnished", label: "Semi-furnished" },
  { value: "fully_furnished", label: "Fully furnished" },
  { value: "unfurnished", label: "Unfurnished" },
  { value: "other", label: "Other" },
];

const HOUSEHOLD = [
  { value: "", label: "Select" },
  { value: "family", label: "Family" },
  { value: "bachelors", label: "Bachelors" },
  { value: "unmarried_couple", label: "Unmarried couple(s)" },
  { value: "other", label: "Other" },
];

const YES_NO = [
  { value: "", label: "Select" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const PARKING = [
  { value: "", label: "Select" },
  { value: "none", label: "Not needed" },
  { value: "bike", label: "Bike only" },
  { value: "car", label: "Car only" },
  { value: "both", label: "Bike & car" },
];

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

/**
 * @param {{
 *   value: ReturnType<typeof emptyTenantRequirementDetails>,
 *   onChange: (next: ReturnType<typeof emptyTenantRequirementDetails>) => void,
 *   errors: Record<string, string>,
 *   propertyType: string,
 * }} props
 */
export default function TenantRequirementDetailsFields({ value, onChange, errors = {}, propertyType }) {
  const commercial = isCommercialPropertyType(propertyType);
  const err = (k) => errors[`tenantRequirementDetails.${k}`];
  const patch = (partial) => onChange({ ...value, ...partial });

  return (
    <div className="md:col-span-2 space-y-4">
      <h3 className="text-sm font-semibold text-sky-900">Tenant requirements *</h3>
      {/* <p className="text-xs text-sky-800/80">
        {commercial
          ? "Commercial space needs: team size, business use, fit-out, parking, and floor."
          : "Who is moving and what they need at home: furnishing, work, pets, parking, and floor."}
      </p> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label={commercial ? "Team size / headcount *" : "Number of people *"}
          name="numberOfPeople"
          type="number"
          min={1}
          max={99}
          value={value.numberOfPeople}
          onChange={(e) => patch({ numberOfPeople: e.target.value })}
          placeholder={commercial ? "e.g. 8" : "e.g. 3"}
          error={err("numberOfPeople")}
        />
        {commercial ? (
          <InputField
            label="Intended business / use *"
            name="intendedCommercialUse"
            value={value.intendedCommercialUse}
            onChange={(e) => patch({ intendedCommercialUse: e.target.value })}
            placeholder="e.g. Retail showroom, office, warehouse, clinic"
            error={err("intendedCommercialUse")}
          />
        ) : (
          <>
            <SelectField
              label="Household type *"
              options={HOUSEHOLD}
              value={value.householdType}
              onChange={(e) =>
                patch({
                  householdType: e.target.value,
                  householdOtherNote:
                    e.target.value === "other" ? value.householdOtherNote : "",
                })
              }
              error={err("householdType")}
            />
            {value.householdType === "other" && (
              <InputField
                label="Describe household (Other) *"
                name="householdOtherNote"
                value={value.householdOtherNote}
                onChange={(e) => patch({ householdOtherNote: e.target.value })}
                placeholder="e.g. Two friends sharing"
                error={err("householdOtherNote")}
              />
            )}
          </>
        )}
        <SelectField
          label="Furnishing needed *"
          options={FURNISHING}
          value={value.furnishingPreference}
          onChange={(e) =>
            patch({
              furnishingPreference: e.target.value,
              furnishingOtherNote:
                e.target.value === "other" ? value.furnishingOtherNote : "",
            })
          }
          error={err("furnishingPreference")}
        />
        {value.furnishingPreference === "other" && (
          <InputField
            label="Describe furnishing (Other) *"
            name="furnishingOtherNote"
            value={value.furnishingOtherNote}
            onChange={(e) => patch({ furnishingOtherNote: e.target.value })}
            placeholder={
              commercial
                ? "e.g. Bare shell, AC + flooring only"
                : "e.g. Modular kitchen only, bare shell"
            }
            error={err("furnishingOtherNote")}
          />
        )}
        {!commercial && (
          <InputField
            label="Occupation / what they do *"
            name="occupation"
            value={value.occupation}
            onChange={(e) => patch({ occupation: e.target.value })}
            placeholder="e.g. Software engineer, business, student"
            error={err("occupation")}
          />
        )}
        {!commercial && (
          <SelectField
            label="Do they have pets? *"
            options={YES_NO}
            value={value.hasPets}
            onChange={(e) => patch({ hasPets: e.target.value })}
            error={err("hasPets")}
          />
        )}
        <SelectField
          label="Bike / car parking needed *"
          options={PARKING}
          value={value.parkingNeeded}
          onChange={(e) => patch({ parkingNeeded: e.target.value })}
          error={err("parkingNeeded")}
        />
        <InputField
          label="Floor preference *"
          name="floorPreference"
          value={value.floorPreference}
          onChange={(e) => patch({ floorPreference: e.target.value })}
          placeholder={
            commercial
              ? "e.g. Ground floor retail, mid-rise office, any"
              : "e.g. Ground floor, 2–4, high floor, any"
          }
          error={err("floorPreference")}
        />
      </div>
    </div>
  );
}

const FURNISH_LABELS = {
  furnished: "Furnished",
  semi_furnished: "Semi-furnished",
  fully_furnished: "Fully furnished",
  unfurnished: "Unfurnished",
  other: "Other",
};

const HOUSEHOLD_LABELS = {
  family: "Family",
  bachelors: "Bachelors",
  unmarried_couple: "Unmarried couple(s)",
  other: "Other",
};

const PARKING_LABELS = {
  none: "Not needed",
  bike: "Bike",
  car: "Car",
  both: "Bike & car",
};

export function formatTenantRequirementDetailsForDisplay(t, propertyType) {
  if (!t || typeof t !== "object") return [];
  const commercial = isCommercialPropertyType(propertyType);
  const furn =
    t.furnishingPreference === "other"
      ? t.furnishingOtherNote
        ? `Other (${t.furnishingOtherNote})`
        : "Other"
      : FURNISH_LABELS[t.furnishingPreference] || "—";
  const park = PARKING_LABELS[t.parkingNeeded] || "—";
  const headcount =
    t.numberOfPeople != null ? String(t.numberOfPeople) : "—";

  if (commercial) {
    return [
      { label: "Team size / headcount", value: headcount },
      { label: "Intended business / use", value: t.intendedCommercialUse || "—" },
      { label: "Furnishing needed", value: furn },
      { label: "Parking needed", value: park },
      { label: "Floor preference", value: t.floorPreference || "—" },
    ];
  }

  const household =
    t.householdType === "other"
      ? t.householdOtherNote
        ? `Other (${t.householdOtherNote})`
        : "Other"
      : HOUSEHOLD_LABELS[t.householdType] || "—";
  const pets = t.hasPets === true ? "Yes" : t.hasPets === false ? "No" : "—";
  return [
    { label: "Number of people", value: headcount },
    { label: "Household type", value: household },
    { label: "Furnishing needed", value: furn },
    { label: "Occupation", value: t.occupation || "—" },
    { label: "Has pets", value: pets },
    { label: "Parking needed", value: park },
    { label: "Floor preference", value: t.floorPreference || "—" },
  ];
}
