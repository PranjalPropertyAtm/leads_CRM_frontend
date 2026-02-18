import { useState, useEffect, useRef } from "react";

export default function SearchableSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  placeholder = "Search...",
  disabled = false,
  multi = false,
  max = 3,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  // close on click outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedValues = multi ? (Array.isArray(value) ? value : value ? [value] : []) : value;

  const toggleSelect = (opt) => {
    const targetName = name || "assignedTo";
    if (!multi) {
      onChange({ target: { name: targetName, value: opt.value } });
      setOpen(false);
      return;
    }

    // multi-select: add/remove
    const cur = Array.isArray(value) ? [...value] : [];
    const idx = cur.indexOf(opt.value);
    let next;
    if (idx === -1) {
      // add
      if (cur.length >= max) return; // respect max
      next = [...cur, opt.value];
    } else {
      // remove
      next = cur.filter((v) => v !== opt.value);
    }
    onChange({ target: { name: targetName, value: next } });
  };

  const removeTag = (val) => {
    const targetName = name || "assignedTo";
    const cur = Array.isArray(value) ? [...value] : [];
    const next = cur.filter((v) => v !== val);
    onChange({ target: { name: targetName, value: next } });
  };

  return (
    <div className={`relative ${compact ? "mb-0" : "mb-3"}`} ref={ref}>
      {label && (
        <label className={`block font-medium text-gray-700 ${compact ? "text-[11px] uppercase tracking-wide mb-0.5" : "text-sm mb-1"}`}>
          {label}
        </label>
      )}

      <div
        className={`border ${compact ? "rounded px-2 py-1.5 text-xs border-gray-200" : "rounded-lg px-3 py-2"} ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white cursor-pointer'} ${
          error ? "border-red-500" : compact ? "" : "border-gray-300"
        }`}
        onClick={() => !disabled && setOpen(!open)}
      >
        {multi ? (
          <div className="flex flex-wrap gap-2">
            {selectedValues.length === 0 && <span className="text-gray-400">Select...</span>}
            {selectedValues.map((val) => (
              <div key={val} className="inline-flex items-center gap-2 px-2 py-1 rounded bg-gray-100 text-sm">
                <span>{options.find((o) => o.value === val)?.label || val}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(val); }} className="text-xs text-gray-500">×</button>
              </div>
            ))}
            {selectedValues.length < max && <span className="text-sm text-gray-400">({selectedValues.length}/{max})</span>}
          </div>
        ) : (
          (() => {
            const selected = options.find((opt) => opt.value === value);
            return selected !== undefined ? selected.label : <span className="text-gray-400">Select...</span>;
          })()
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {open && (
        <div className="mt-1 absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border-b border-gray-200 outline-none text-sm"
          />

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="p-3 text-gray-400 text-sm">No results found...</p>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = multi ? (Array.isArray(value) ? value.includes(opt.value) : false) : value === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleSelect(opt)}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between ${isSelected ? 'bg-gray-100' : ''}`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="text-sm text-green-600">✓</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
