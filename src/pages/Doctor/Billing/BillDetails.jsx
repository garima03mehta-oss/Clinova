import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { db } from "../../../firebase/config";

export default function BillDetails() {
  const navigate = useNavigate();
  const { billId } = useParams();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const billRef = doc(db, "bills", billId);
        const snapshot = await getDoc(billRef);

        if (snapshot.exists()) {
          setBill({
            id: snapshot.id,
            ...snapshot.data(),
          });
        }
      } catch (error) {
        console.error("Bill details error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (billId) {
      fetchBill();
    }
  }, [billId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted">
          Loading bill...
        </p>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Bill not found
          </h1>

          <button
            onClick={() => navigate("/doctor/billing")}
            className="mt-4 bg-primary text-white px-5 py-3 rounded-xl"
          >
            Back to Billing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-body">

      <header className="bg-surface border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5">

          <button
            onClick={() => navigate("/doctor/billing")}
            className="text-primary text-sm font-medium"
          >
            ← Billing Dashboard
          </button>

          <h1 className="text-2xl font-semibold text-text mt-3">
            Bill Details
          </h1>

        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        <section className="bg-surface border border-gray-200 rounded-2xl p-6">

          <div className="flex justify-between gap-4">

            <div>
              <p className="text-xs text-text-muted">
                Patient
              </p>

              <h2 className="text-xl font-semibold mt-1">
                {bill.patientName}
              </h2>

              <p className="text-sm text-text-muted mt-1">
                Patient ID: {bill.patientId}
              </p>
            </div>

            <span
              className={`h-fit px-3 py-1 rounded-full text-xs font-medium ${
                bill.paymentStatus === "PAID"
                  ? "bg-green-50 text-green-700"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              {bill.paymentStatus}
            </span>

          </div>

          <div className="mt-8">

            <h3 className="font-semibold">
              Bill Items
            </h3>

            <div className="mt-4 divide-y divide-gray-200">

              {(bill.items || []).map((item, index) => (

                <div
                  key={index}
                  className="py-4 flex justify-between gap-4"
                >

                  <div>
                    <p className="font-medium">
                      {item.description}
                    </p>

                    <p className="text-sm text-text-muted mt-1">
                      {item.quantity} × ₹
                      {Number(item.amount || 0).toFixed(2)}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹{Number(item.subtotal || 0).toFixed(2)}
                  </p>

                </div>

              ))}

            </div>

          </div>

          <div className="mt-6 pt-5 border-t border-gray-200 flex justify-between">

            <span className="font-semibold">
              Total
            </span>

            <span className="text-xl font-semibold">
              ₹{Number(bill.totalAmount || 0).toFixed(2)}
            </span>

          </div>

        </section>

      </main>
    </div>
  );
}
