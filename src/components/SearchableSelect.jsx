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

  return (
    <div className="mb-3  relative" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={`border rounded-lg px-3 py-2 ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white cursor-pointer'} ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        onClick={() => !disabled && setOpen(!open)}
      >
        {value
          ? options.find((opt) => opt.value === value)?.label
          : <span className="text-gray-400">Select...</span>}
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
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    const targetName = name || "assignedTo";
                    onChange({ target: { name: targetName, value: opt.value } });
                    setOpen(false);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
