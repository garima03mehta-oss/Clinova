import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../../firebase/config";

export default function BillingDashboard() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      const doctorId = auth.currentUser?.uid;

      if (!doctorId) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "bills"),
          where("doctorId", "==", doctorId)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBills(data);
      } catch (error) {
        console.error("Error loading bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const totalAmount = bills.reduce(
    (sum, bill) => sum + Number(bill.totalAmount || 0),
    0
  );

  const paidAmount = bills
    .filter((bill) => bill.paymentStatus === "PAID")
    .reduce(
      (sum, bill) => sum + Number(bill.totalAmount || 0),
      0
    );

  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-bg font-body">

      <header className="bg-surface border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-primary text-xs font-bold tracking-wide">
              CLINOVA • DOCTOR PORTAL
            </p>

            <h1 className="text-2xl font-semibold text-text mt-1">
              Billing & Expenses
            </h1>
          </div>

          <button
            onClick={() => navigate("/doctor/dashboard")}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-surface border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-text-muted">
              Total Billing
            </p>

            <p className="text-2xl font-semibold mt-2">
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>

          <div className="bg-surface border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-text-muted">
              Paid
            </p>

            <p className="text-2xl font-semibold text-green-700 mt-2">
              ₹{paidAmount.toFixed(2)}
            </p>
          </div>

          <div className="bg-surface border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-text-muted">
              Pending
            </p>

            <p className="text-2xl font-semibold text-orange-700 mt-2">
              ₹{pendingAmount.toFixed(2)}
            </p>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          <button
            onClick={() => navigate("/doctor/billing/create")}
            className="bg-primary text-white px-5 py-3 rounded-xl font-medium"
          >
            + Create New Bill
          </button>

          <button
            onClick={() => navigate("/doctor/billing/expenses")}
            className="border border-gray-300 px-5 py-3 rounded-xl font-medium"
          >
            Manage Expenses
          </button>

        </div>

        <section className="bg-surface border border-gray-200 rounded-2xl overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="font-semibold text-lg">
              Patient Bills
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-text-muted">
              Loading bills...
            </div>
          ) : bills.length === 0 ? (
            <div className="p-10 text-center text-text-muted">
              No bills created yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">

              {bills.map((bill) => (
                <button
                  key={bill.id}
                  onClick={() =>
                    navigate(`/doctor/billing/${bill.id}`)
                  }
                  className="w-full text-left p-5 hover:bg-gray-50 transition"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                    <div>
                      <h3 className="font-semibold text-text">
                        {bill.patientName || "Patient"}
                      </h3>

                      <p className="text-xs text-text-muted mt-1">
                        Patient ID: {bill.patientId || "Not available"}
                      </p>

                      <p className="text-xs text-text-muted mt-1">
                        Bill ID: {bill.id}
                      </p>
                    </div>

                    <div className="text-left md:text-right">

                      <p className="font-semibold text-text">
                        ₹{Number(bill.totalAmount || 0).toFixed(2)}
                      </p>

                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          bill.paymentStatus === "PAID"
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {bill.paymentStatus || "PENDING"}
                      </span>

                    </div>

                  </div>

                </button>
              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}