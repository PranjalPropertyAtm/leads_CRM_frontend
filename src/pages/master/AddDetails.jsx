
import React, { act, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Square, MapPin } from "lucide-react";
import { useMastersStore } from "../../store/masterStore";
import {notify} from "../../utils/toast.js";
// if notify path differs, adjust or remove notifications

export default function AddDetails() {
    const { masters, fetchMasters, saveMasters, loading } = useMastersStore();

    const tabs = [
        { id: "propertyTypes", label: "Property Types", icon: <Square size={16} /> },
        { id: "subPropertyTypes", label: "Sub Property Types", icon: <MapPin size={16} /> },
        { id: "sources", label: "Sources", icon: <Plus size={16} /> },
        { id: "cities", label: "Cities", icon: <MapPin size={16} /> },
    ];

    const [activeTab, setActiveTab] = useState("propertyTypes");

    // local form states for 'add' inputs per tab
    const [label, setLabel] = useState("");
    const [value, setValue] = useState(""); // optional value field
    const [selectedPropertyType, setSelectedPropertyType] = useState("");

    // confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [toDelete, setToDelete] = useState(null); // { tab, index, label }

    // fetch masters once
    useEffect(() => {
        fetchMasters();
    }, []);

    // ensure masters shape exists
    const safeMasters = {
        propertyTypes: Array.isArray(masters?.propertyTypes) ? masters.propertyTypes : [],
        subPropertyTypes: Array.isArray(masters?.subPropertyTypes) ? masters.subPropertyTypes : [],
        sources: Array.isArray(masters?.sources) ? masters.sources : [],
        cities: Array.isArray(masters?.cities) ? masters.cities : [],
        ...masters,
    };

    // helper to persist: update store state then call saveMasters
    const persistMasters = async (newMasters, successMsg) => {
        // update zustand state
        useMastersStore.setState({ masters: newMasters });
        try {
            await saveMasters(); // saveMasters reads get().masters internally
              if (successMsg) notify?.success?.(successMsg);
        } catch (e) {
            // saveMasters shows toast on error; still keep guard
            console.error("Save masters failed", e);
              notify?.error?.("Failed to save changes");
        }
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
            return <p className="text-gray-500 italic text-center py-6">No items added yet.</p>;
        }
        return (
            <ul className="space-y-2">
                {list.map((it, i) => (
                    <li
                        key={i}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition-all duration-150"
                    >
                        <div className="flex flex-col">

                            <span className="text-sm font-bold text-gray-800">{it.label ?? it.value}</span>
                            {it.propertyType && <span className="text-xs text-gray-500">Parent: {it.propertyType}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => requestDelete(tabKey, i)}
                                className="text-red-600 hover:text-red-700 text-sm"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-[Inter]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">Masters — Add / Edit</h1>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition ${activeTab === tab.id ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Top Add Card (like settings 'Add Designation' card) */}
                <div className="border p-5 rounded-xl shadow-sm bg-white">
                    <h2 className="text-lg font-semibold mb-3">
                        {activeTab === "subPropertyTypes" ? "➕ Add Sub Property Type" : "➕ Add New " + tabs.find(t => t.id === activeTab).label}
                    </h2>

                    <div className="flex flex-col gap-3">
                        {activeTab === "subPropertyTypes" && (
                            <select
                                value={selectedPropertyType}
                                onChange={(e) => setSelectedPropertyType(e.target.value)}
                                className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                            >
                                <option value="">Select Property Type</option>
                                {safeMasters.propertyTypes.map((pt, idx) => (
                                    <option key={idx} value={pt.label}>
                                        {pt.label}
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
                                                : "Label"
                            }

                            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />

                        {/* optional value field */}
                        {/* <input
              type="text"
              placeholder="Value (optional, e.g. residential)"
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            /> */}

                        <div className="flex items-center gap-3">
                            <button onClick={handleAdd} className="bg-slate-900 text-white px-4 py-2 rounded-lg">
                                Add
                            </button>
                            <button onClick={() => { setLabel(""); setValue(""); setSelectedPropertyType(""); }} className="px-4 py-2 rounded-lg border">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Card (like settings lists) */}
                <div className="border p-5 rounded-xl shadow-sm bg-white">
                    <h2 className="text-lg font-semibold mb-3">📋 {tabs.find(t => t.id === activeTab).label}</h2>
                    {renderList(activeTab)}
                </div>
            </motion.div>

            {/* Shared confirmation modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Confirm Deletion</h2>
                        <p className="text-gray-600 mb-5">Are you sure you want to delete <b>"{toDelete?.label}"</b>?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
