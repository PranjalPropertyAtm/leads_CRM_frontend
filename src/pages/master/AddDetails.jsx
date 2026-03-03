
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Square, MapPin } from "lucide-react";
import { useFetchMasters, useSaveMasters } from "../../hooks/useMastersQueries.js";
import { notify } from "../../utils/toast.js";
// if notify path differs, adjust or remove notifications

export default function AddDetails() {
    const { data: masters = {}, isLoading: loading } = useFetchMasters();
    const saveMastersMutation = useSaveMasters();

    const tabs = [
        { id: "propertyTypes", label: "Property Types", icon: <Square size={14} /> },
        { id: "subPropertyTypes", label: "Sub Property Types", icon: <MapPin size={14} /> },
        { id: "sources", label: "Sources", icon: <Plus size={14} /> },
        { id: "cities", label: "Cities", icon: <MapPin size={14} /> },
        { id: "locations", label: "Locations", icon: <MapPin size={14} /> },
    ];

    const [activeTab, setActiveTab] = useState("propertyTypes");

    // local form states for 'add' inputs per tab
    const [label, setLabel] = useState("");
    const [value, setValue] = useState(""); // optional value field
    const [selectedPropertyType, setSelectedPropertyType] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    // confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [toDelete, setToDelete] = useState(null); // { tab, index, label }

    // ensure masters shape exists
    const safeMasters = {
        propertyTypes: Array.isArray(masters?.propertyTypes) ? masters.propertyTypes : [],
        subPropertyTypes: Array.isArray(masters?.subPropertyTypes) ? masters.subPropertyTypes : [],
        sources: Array.isArray(masters?.sources) ? masters.sources : [],
        cities: Array.isArray(masters?.cities) ? masters.cities : [],
        locations: Array.isArray(masters?.locations) ? masters.locations : [],
        ...masters,
    };

    // helper to persist: call saveMasters mutation
    const persistMasters = async (newMasters, successMsg) => {
        saveMastersMutation.mutate(newMasters, {
            onSuccess: () => {
                if (successMsg) notify?.success?.(successMsg);
            },
            onError: (error) => {
                console.error("Save masters failed", error);
                const errorMsg = error.response?.data?.message || "Failed to save changes";
                notify?.error?.(errorMsg);
            },
        });
    };

    // Add item for current tab
    const handleAdd = async () => {
        const trimmedLabel = (label || "").trim();
        if (!trimmedLabel) {
            notify?.error?.("Label is required");
            return;
        }

        const newMasters = { ...safeMasters };

        if (activeTab === "propertyTypes") {
            newMasters.propertyTypes = [...newMasters.propertyTypes, { label: trimmedLabel, value: value || trimmedLabel }];
            setLabel("");
            setValue("");
            await persistMasters(newMasters, "Property type added");
        } else if (activeTab === "subPropertyTypes") {
            if (!selectedPropertyType) {
                notify?.error?.("Please select a parent property type");
                return;
            }
            newMasters.subPropertyTypes = [
                ...newMasters.subPropertyTypes,
                { propertyType: selectedPropertyType, label: trimmedLabel, value: value || trimmedLabel },
            ];
            setLabel("");
            setValue("");
            setSelectedPropertyType("");
            await persistMasters(newMasters, "Sub-property type added");
        } else if (activeTab === "sources") {
            newMasters.sources = [...newMasters.sources, { label: trimmedLabel, value: value || trimmedLabel }];
            setLabel("");
            setValue("");
            await persistMasters(newMasters, "Source added");
        } else if (activeTab === "cities") {
            newMasters.cities = [...newMasters.cities, { label: trimmedLabel, value: value || trimmedLabel }];
            setLabel("");
            setValue("");
            await persistMasters(newMasters, "City added");
        }
        else if (activeTab === "locations") {
            if (!selectedCity) {
                notify?.error?.("Please select a city for the location");
                return;
            }
            newMasters.locations = [
                ...newMasters.locations,
                { city: selectedCity, label: trimmedLabel, value: value || trimmedLabel },
            ];
            setLabel("");
            setValue("");
            setSelectedPropertyType("");
            await persistMasters(newMasters, "Location added");
        }
    };

    // request deletion (opens confirm modal)
    const requestDelete = (tab, index) => {
        const item = safeMasters[tab][index];
        setToDelete({ tab, index, label: item?.label ?? item?.value ?? `#${index}` });
        setShowConfirmModal(true);
    };

    // actually delete
    const handleDelete = async () => {
        if (!toDelete) return;
        const { tab, index } = toDelete;
        const newMasters = { ...safeMasters };
        newMasters[tab] = newMasters[tab].filter((_, i) => i !== index);
        setShowConfirmModal(false);
        setToDelete(null);
        await persistMasters(newMasters, "Deleted successfully");
    };

    // render list items for active tab
    const renderList = (tabKey) => {
        const list = safeMasters[tabKey] || [];

        if (!list.length) {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40">
                    <p className="text-sm font-medium text-slate-700">
                        No {tabs.find((t) => t.id === tabKey)?.label.toLowerCase()} added yet.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Use the form above to add your first entry.
                    </p>
                </div>
            );
        }

        // Grouped view for sub property types by property type
        if (tabKey === "subPropertyTypes") {
            const grouped = list.reduce((acc, item) => {
                const parent = item.propertyType || "Unassigned";
                if (!acc[parent]) acc[parent] = [];
                acc[parent].push(item);
                return acc;
            }, {});

            const parentKeys = Object.keys(grouped).sort((a, b) =>
                a.localeCompare(b, undefined, { sensitivity: "base" })
            );

            return (
                <div className="space-y-4">
                    {parentKeys.map((parentName) => {
                        const children = grouped[parentName].slice().sort((a, b) =>
                            (a.label || a.value || "").localeCompare(b.label || b.value || "", undefined, {
                                sensitivity: "base",
                            })
                        );
                        return (
                            <div
                                key={parentName}
                                className="rounded-2xl border border-slate-100 bg-slate-50/60 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-100/70 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {parentName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {children.length} sub type
                                            {children.length > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-2.5 py-2 space-y-1.5">
                                    {children.map((it, idx) => (
                                        <div
                                            key={`${parentName}-${idx}`}
                                            className="group flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 hover:bg-white hover:shadow-xs transition-all"
                                        >
                                            <p className="text-sm text-slate-800 font-medium truncate">
                                                {it.label ?? it.value}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    requestDelete(
                                                        tabKey,
                                                        safeMasters[tabKey].indexOf(it)
                                                    )
                                                }
                                                className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Grouped view for locations by city
        if (tabKey === "locations") {
            const grouped = list.reduce((acc, item) => {
                const city = item.city || "Unassigned";
                if (!acc[city]) acc[city] = [];
                acc[city].push(item);
                return acc;
            }, {});

            const cityKeys = Object.keys(grouped).sort((a, b) =>
                a.localeCompare(b, undefined, { sensitivity: "base" })
            );

            return (
                <div className="space-y-4">
                    {cityKeys.map((cityName) => {
                        const locations = grouped[cityName].slice().sort((a, b) =>
                            (a.label || a.value || "").localeCompare(b.label || b.value || "", undefined, {
                                sensitivity: "base",
                            })
                        );
                        return (
                            <div
                                key={cityName}
                                className="rounded-2xl border border-slate-100 bg-slate-50/60 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-100/70 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {cityName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {locations.length} location
                                            {locations.length > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-2.5 py-2 space-y-1.5">
                                    {locations.map((it, idx) => (
                                        <div
                                            key={`${cityName}-${idx}`}
                                            className="group flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 hover:bg-white hover:shadow-xs transition-all"
                                        >
                                            <p className="text-sm text-slate-800 font-medium truncate">
                                                {it.label ?? it.value}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    requestDelete(
                                                        tabKey,
                                                        safeMasters[tabKey].indexOf(it)
                                                    )
                                                }
                                                className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Default flat view for simple lists (propertyTypes, sources, cities)
        const sorted = list
            .slice()
            .sort((a, b) =>
                (a.label || a.value || "").localeCompare(b.label || b.value || "", undefined, {
                    sensitivity: "base",
                })
            );

        return (
            <div className="space-y-2">
                {sorted.map((it, i) => (
                    <div
                        key={i}
                        className="group flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3 hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all"
                    >
                        <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5 shrink-0 h-6 w-6 rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 flex items-center justify-center">
                                {i + 1}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {it.label ?? it.value}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => requestDelete(tabKey, i)}
                            className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-[Inter]">
            <div className="w-full space-y-6">
                <header className="flex flex-col gap-2">
                    <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                        Masters
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl">
                        Configure the master lists used across the application, such as property
                        types, sub types, sources, cities and locations.
                    </p>
                </header>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs md:text-sm font-medium rounded-xl transition
                                        ${isActive
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "text-slate-700 hover:bg-white/70"
                                        }`}
                                >
                                    <span className="text-slate-500">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="text-xs text-slate-500">
                        {loading || saveMastersMutation.isLoading
                            ? "Saving changes…"
                            : "Changes are saved automatically"}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900">
                                {activeTab === "subPropertyTypes"
                                    ? "Add Sub Property Type"
                                    : `Add New ${tabs.find((t) => t.id === activeTab).label}`}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Enter the details and click{" "}
                                <span className="font-medium text-slate-700">Add</span> to update
                                the selected master list.
                            </p>
                        </div>

                        <div className="px-5 py-5">
                            {loading ? (
                                <p className="text-sm text-slate-500">Loading masters…</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {activeTab === "subPropertyTypes" && (
                                            <select
                                                value={selectedPropertyType}
                                                onChange={(e) => setSelectedPropertyType(e.target.value)}
                                                className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/70 focus:border-slate-900/40 outline-none bg-white"
                                            >
                                                <option value="">Select Property Type</option>
                                                {safeMasters.propertyTypes.map((pt, idx) => (
                                                    <option key={idx} value={pt.label}>
                                                        {pt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {activeTab === "locations" && (
                                            <select
                                                value={selectedCity}
                                                onChange={(e) => setSelectedCity(e.target.value)}
                                                className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/70 focus:border-slate-900/40 outline-none bg-white"
                                            >
                                                <option value="">Select City</option>
                                                {safeMasters.cities.map((city, idx) => (
                                                    <option key={idx} value={city.label}>
                                                        {city.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        <input
                                            type="text"
                                            placeholder={
                                                activeTab === "subPropertyTypes"
                                                    ? "Sub type label (e.g. 2 BHK)"
                                                    : activeTab === "cities"
                                                        ? "City name (e.g. Hyderabad)"
                                                        : activeTab === "sources"
                                                            ? "Source name (e.g. Facebook)"
                                                            : activeTab === "propertyTypes"
                                                                ? "Property type (e.g. Residential)"
                                                                : activeTab === "locations"
                                                                    ? "Location name (e.g. Vikas Nagar)"
                                                                    : "Label"
                                            }
                                            className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/70 focus:border-slate-900/40 outline-none bg-white"
                                            value={label}
                                            onChange={(e) => setLabel(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 pt-1">
                                        <button
                                            onClick={handleAdd}
                                            disabled={loading || saveMastersMutation.isLoading}
                                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <Plus size={16} />
                                            <span>Add</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLabel("");
                                                setValue("");
                                                setSelectedPropertyType("");
                                                setSelectedCity("");
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base md:text-lg font-semibold text-slate-900">
                                    {tabs.find((t) => t.id === activeTab).label}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Existing values below. Remove items carefully, as they may be
                                    referenced by existing records.
                                </p>
                            </div>
                        </div>
                        <div className="px-2 md:px-5 py-3 md:py-5">
                            {loading ? (
                                <p className="text-sm text-slate-500">Loading masters…</p>
                            ) : (
                                renderList(activeTab)
                            )}
                        </div>
                    </section>
                </motion.div>

                {showConfirmModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">
                                Confirm deletion
                            </h2>
                            <p className="text-sm text-slate-600 mb-5">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-900">
                                    "{toDelete?.label}"
                                </span>
                                ? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Yes, delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
