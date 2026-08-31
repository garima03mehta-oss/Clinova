import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../../firebase/config";

export default function CreateBill() {
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      amount: "",
    },
  ]);

  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        amount: "",
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0) *
          Number(item.amount || 0),
      0
    );
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();

    const doctorId = auth.currentUser?.uid;

    if (!doctorId) {
      alert("Doctor is not authenticated.");
      return;
    }

    if (!patientName || !patientId) {
      alert("Please enter patient details.");
      return;
    }

    if (
      items.some(
        (item) =>
          !item.description ||
          Number(item.quantity) <= 0 ||
          Number(item.amount) < 0
      )
    ) {
      alert("Please enter valid bill items.");
      return;
    }

    try {
      setSaving(true);

      const totalAmount = calculateTotal();

      await addDoc(collection(db, "bills"), {
        doctorId,
        patientName,
        patientId,
        items: items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          amount: Number(item.amount),
          subtotal:
            Number(item.quantity) * Number(item.amount),
        })),
        totalAmount,
        paymentStatus,
        createdAt: serverTimestamp(),
      });

      alert("Bill created successfully.");

      navigate("/doctor/billing");
    } catch (error) {
      console.error("Create bill error:", error);
      alert("Unable to create bill.");
    } finally {
      setSaving(false);
    }
  };

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
            Create Patient Bill
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        <form
          onSubmit={handleCreateBill}
          className="bg-surface border border-gray-200 rounded-2xl p-6"
        >

          <h2 className="font-semibold text-lg">
            Patient Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Patient Name"
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

            <input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Patient ID"
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

          </div>

          <h2 className="font-semibold text-lg mt-8">
            Bill Items
          </h2>

          <div className="space-y-4 mt-4">

            {items.map((item, index) => (

              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4"
              >

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  <input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Description"
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                    placeholder="Quantity"
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "amount",
                        e.target.value
                      )
                    }
                    placeholder="Amount"
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />

                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 text-sm mt-3"
                  >
                    Remove Item
                  </button>
                )}

              </div>

            ))}

          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 border border-primary text-primary px-4 py-2 rounded-xl"
          >
            + Add Item
          </button>

          <div className="mt-8">

            <label className="text-sm text-text-muted">
              Payment Status
            </label>

            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
            </select>

          </div>

          <div className="mt-8 bg-gray-50 rounded-xl p-5 flex items-center justify-between">

            <span className="font-semibold">
              Total Amount
            </span>

            <span className="text-xl font-semibold">
              ₹{calculateTotal().toFixed(2)}
            </span>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full bg-primary text-white py-3 rounded-xl font-medium disabled:opacity-50"
          >
            {saving ? "Creating Bill..." : "Create Bill"}
          </button>

        </form>

      </main>
    </div>
  );
}