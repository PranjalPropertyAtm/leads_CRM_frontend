// import React from "react";
// import { useParams } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useCustomerById } from "../../hooks/useCustomerQueries.js";
// import VisitHistory from "../../components/VisitHistory";
// // import { Card } from "../../components/ui/Card";

// const buildLeadArray = (cust) => {
//   const list = [cust?.leadId, ...(cust?.leadHistory || [])].filter(Boolean);
//   const map = new Map();
//   list.forEach((item) => {
//     const key = item?._id?.toString() || Math.random().toString();
//     if (!map.has(key)) map.set(key, item);
//   });
//   return Array.from(map.values());
// };

// const formatDate = (value) => {
//   if (!value) return "";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "";
//   return d.toLocaleDateString();
// };

// export default function CustomerDetail() {
//   const { id } = useParams();
//   const { data, isLoading } = useCustomerById(id);

//   if (isLoading) return <div className="p-10 text-center">Loading...</div>;

//   const customer = data;
//   const lead = customer?.leadId;
//   const leadHistory = buildLeadArray(customer);

//   return (
//     <div className="p-6 font-[Inter]">
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

//         <h1 className="text-3xl font-bold text-gray-900 mb-5">
//           Customer Details
//         </h1>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//           {/* CUSTOMER CARD */}
//           <Card title="Customer Information">
//             <Info label="Name" value={customer.name} />
//             <Info label="Type" value={customer.customerType} />
//             <Info label="Mobile" value={customer.mobileNumber} />
//             <Info label="Email" value={customer.email} />
//             <Info label="City" value={customer.city} />
//             <Info label="Status" value={customer.status} />
//           </Card>

//           {/* LEAD CARD */}
//           <Card title="Latest Lead">
//             <Info label="Property Type" value={lead?.propertyType} />
//             <Info label="Sub Type" value={lead?.subPropertyType} />
//             <Info label="Source" value={lead?.source} />
//             <Info label="Created On" value={formatDate(lead?.createdAt)} />

//             {lead?.customerType === "tenant" && (
//               <Info label="Preferred Location" value={lead?.preferredLocation} />
//             )}

//             {lead?.customerType === "owner" && (
//               <>
//                 <Info label="Property Location" value={lead?.propertyLocation} />
//                 <Info label="Area" value={lead?.area} />
//               </>
//             )}
//           </Card>

//         </div>

//         {/* VISIT HISTORY */}
//         {lead && (
//           <div className="mt-8">
//             <VisitHistory leadId={lead._id} />
//           </div>
//         )}

//         {/* LEAD HISTORY LIST */}
//         <div className="mt-8">
//           <Card title="Lead History">
//             {leadHistory.length === 0 ? (
//               <p className="text-sm text-gray-500">No leads yet.</p>
//             ) : (
//               <div className="divide-y">
//                 {leadHistory.map((lh, idx) => (
//                   <div key={lh?._id || idx} className="py-3 flex items-center justify-between">
//                     <div className="flex flex-col">
//                       <span className="font-medium text-gray-900">
//                         {lh?.customerName || lh?.ownerName || "Lead"}
//                       </span>
//                       <span className="text-xs text-gray-500">
//                         {lh?.propertyType || "-"} · {lh?.customerType || "-"}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
//                         {lh?.status || "Lead"}
//                       </span>
//                       <span className="text-xs text-gray-400">{formatDate(lh?.createdAt)}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </Card>
//         </div>

//       </motion.div>
//     </div>
//   );
// }

// function Info({ label, value }) {
//   return (
//     <div className="mb-3">
//       <p className="text-gray-500 text-sm">{label}</p>
//       <p className="text-gray-800 font-medium">{value || "N/A"}</p>
//     </div>
//   );
// }
