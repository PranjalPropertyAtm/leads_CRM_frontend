// import { motion } from "framer-motion";
// import { X, Calendar, User } from "lucide-react";
// import { useLeadVisits } from "../hooks/useVisitQueries";

// export default function VisitHistory({ open, onClose, leadId }) {
//   const { data: visits = [], isLoading } = useLeadVisits(leadId);

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-white p-6 rounded-xl w-full max-w-xl h-[80vh] overflow-y-auto"
//       >
//         <div className="flex justify-between">
//           <h2 className="text-xl font-semibold">Visit History</h2>
//           <button onClick={onClose}>
//             <X size={22} />
//           </button>
//         </div>

//         {isLoading ? (
//           <p>Loading...</p>
//         ) : visits.length === 0 ? (
//           <p className="text-gray-500 mt-4">No visits recorded.</p>
//         ) : (
//           <div className="mt-5 space-y-4">
//             {visits.map((v) => (
//               <div key={v._id} className="border rounded-lg p-4">
//                 <div className="flex justify-between">
//                   <p className="font-semibold">
//                     <Calendar size={16} className="inline-block mr-1" />
//                     {new Date(v.visitDate).toLocaleDateString()}
//                   </p>

//                   <p className="text-sm flex items-center gap-1">
//                     <User size={16} /> {v.visitedBy?.name}
//                   </p>
//                 </div>

//                 <p className="text-gray-700 mt-2">
//                   <b>Location:</b> {v.propertyLocation}
//                 </p>
//                 <p className="text-gray-700 mt-1">
//                   <b>Details:</b> {v.propertyDetails}
//                 </p>
                

//                 {v.tenantFeedback && (
//                   <p className="text-gray-700 mt-1">
//                     <b>Feedback:</b> {v.tenantFeedback}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// }


import { motion } from "framer-motion";
import { X, Calendar, User } from "lucide-react";
import { useLeadVisits } from "../hooks/useVisitQueries";

export default function VisitHistory({ open, onClose, leadId }) {
  const { data: visits = [], isLoading } = useLeadVisits(leadId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl w-full max-w-xl h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Visit History</h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {isLoading ? (
          <p className="mt-4 text-gray-500">Loading...</p>
        ) : visits.length === 0 ? (
          <p className="text-gray-500 mt-4">No visits recorded.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {visits.map((v) => {
              // ---- SAFE VISITED-BY NAME RESOLUTION ----
              const visitedByName =
                typeof v.visitedBy === "string"
                  ? "Unknown"
                  : v.visitedBy?.name || "Unknown";

              return (
                <div key={v._id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <p className="font-semibold">
                      <Calendar size={16} className="inline-block mr-1" />
                      {new Date(v.visitDate).toLocaleDateString()}
                    </p>

                    <p className="text-sm flex items-center gap-1">
                      <User size={16} /> {visitedByName}
                    </p>
                  </div>

                  <p className="text-gray-700 mt-2">
                    <b>Location:</b> {v.propertyLocation}
                  </p>

                  <p className="text-gray-700 mt-1">
                    <b>Details:</b> {v.propertyDetails}
                  </p>

                  {v.tenantFeedback && (
                    <p className="text-gray-700 mt-1">
                      <b>Feedback:</b> {v.tenantFeedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
