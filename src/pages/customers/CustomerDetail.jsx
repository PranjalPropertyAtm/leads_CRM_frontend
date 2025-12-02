import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useCustomerById } from "../../hooks/useCustomerQueries.js";
import VisitHistory from "../../components/VisitHistory";
import { Card } from "../../components/ui/Card";

export default function CustomerDetail() {
  const { id } = useParams();
  const { data, isLoading } = useCustomerById(id);

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  const customer = data.customer;
  const lead = data.lead;

  return (
    <div className="p-6 font-[Inter]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        <h1 className="text-3xl font-bold text-gray-900 mb-5">
          Customer Details
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CUSTOMER CARD */}
          <Card title="Customer Information">
            <Info label="Name" value={customer.name} />
            <Info label="Type" value={customer.customerType} />
            <Info label="Mobile" value={customer.mobileNumber} />
            <Info label="Email" value={customer.email} />
            <Info label="City" value={customer.city} />
            <Info label="Status" value={customer.status} />
          </Card>

          {/* LEAD CARD */}
          <Card title="Lead Information">
            <Info label="Property Type" value={lead.propertyType} />
            <Info label="Sub Type" value={lead.subPropertyType} />
            <Info label="Source" value={lead.source} />

            {lead.customerType === "tenant" && (
              <Info label="Preferred Location" value={lead.preferredLocation} />
            )}

            {lead.customerType === "owner" && (
              <>
                <Info label="Property Location" value={lead.propertyLocation} />
                <Info label="Area" value={lead.area} />
              </>
            )}
          </Card>

        </div>

        {/* VISIT HISTORY */}
        <div className="mt-8">
          <VisitHistory leadId={lead._id} />
        </div>

      </motion.div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="mb-3">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-800 font-medium">{value || "N/A"}</p>
    </div>
  );
}
