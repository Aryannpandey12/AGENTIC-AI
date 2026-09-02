import { useState } from "react";
import { Image, IndianRupee, X } from "lucide-react";
import { menuApi } from "../../services/api.js";
import { formatCurrency, isAvailable, normalizeApiObject } from "../../utils/helpers.js";

const fallbackImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80";

export default function MenuItemFormModal({ item, onClose, onSaved }) {
  const isEdit = Boolean(item);
  const [form, setForm] = useState({
    item_id: item?.item_id || "",
    item_name: item?.item_name || "",
    category: item?.category || "Pizza",
    price: item?.price ? String(item.price) : "",
    prep_time: item?.prep_time ? String(item.prep_time) : "20",
    image_url: item?.image_url || "",
    available: item ? isAvailable(item) : true
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.item_name.trim()) nextErrors.item_name = "Dish title is required";
    if (!form.category.trim()) nextErrors.category = "Category is required";
    if (!form.price.trim() || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      nextErrors.price = "Enter a valid INR price greater than 0";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      ...item,
      item_id: isEdit ? item.item_id : undefined,
      item_name: form.item_name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      prep_time: Number(form.prep_time || 20),
      image_url: form.image_url.trim() || fallbackImage,
      available: Boolean(form.available)
    };

    try {
      setSubmitting(true);
      setServerError("");
      const method = isEdit ? menuApi.updateMenuItem : menuApi.addMenuItem;
      const response = await method(payload);
      const data = normalizeApiObject(response);
      
      if (data && data.success === false) {
        setServerError(data.message || "Failed to update catalog on backend.");
        return;
      }
      onSaved();
    } catch (err) {
      setServerError(err?.response?.data?.message || "Failed communicating with Google Sheets backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/80">
          <div>
            <h3 className="text-xl font-black text-slate-950">
              {isEdit ? `Edit Dish • ${item.item_id}` : "Create New Gourmet Offering"}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Adjust pricing, imagery, and instant KDS availability</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Left Column: Form Fields */}
            <div className="space-y-4 sm:col-span-1">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Dish Title *
                </label>
                <input
                  placeholder="e.g. Peri Peri Fries"
                  className={`form-input ${errors.item_name ? "border-red-400 ring-2 ring-red-100" : ""}`}
                  value={form.item_name}
                  onChange={(event) => updateField("item_name", event.target.value)}
                />
                {errors.item_name && <p className="mt-1 text-xs font-bold text-red-600">{errors.item_name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <input
                    placeholder="Pizza, Burgers"
                    list="catalog-categories"
                    className={`form-input ${errors.category ? "border-red-400 ring-2 ring-red-100" : ""}`}
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                  />
                  <datalist id="catalog-categories">
                    <option value="Pizza" />
                    <option value="Burgers" />
                    <option value="Biryani" />
                    <option value="Chinese" />
                    <option value="Desserts" />
                    <option value="Beverages" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Prep Time (Mins)
                  </label>
                  <input
                    type="number"
                    placeholder="20"
                    className="form-input font-mono"
                    value={form.prep_time}
                    onChange={(event) => updateField("prep_time", event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Price (INR ₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-3 text-emerald-600" size={16} />
                  <input
                    type="number"
                    placeholder="299"
                    className={`form-input pl-10 font-mono font-black text-base ${errors.price ? "border-red-400 ring-2 ring-red-100" : ""}`}
                    value={form.price}
                    onChange={(event) => updateField("price", event.target.value)}
                  />
                </div>
                {errors.price && <p className="mt-1 text-xs font-bold text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Food Image URL (High Res)
                </label>
                <input
                  placeholder="https://images.unsplash.com/..."
                  className="form-input text-xs font-mono text-slate-600"
                  value={form.image_url}
                  onChange={(event) => updateField("image_url", event.target.value)}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    checked={form.available}
                    onChange={(event) => updateField("available", event.target.checked)}
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Instant KDS Availability</span>
                    <span className="text-[10px] font-medium text-slate-400 block">Uncheck to hide dish from customer web app</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Right Column: Live Image Preview Card */}
            <div className="space-y-2 sm:col-span-1 flex flex-col">
              <span className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Live Customer Card Preview
              </span>
              
              <div className="flex-1 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 flex flex-col items-center justify-center text-center overflow-hidden relative min-h-[220px]">
                <div className="aspect-[16/11] w-full overflow-hidden rounded-xl bg-slate-200 mb-3 shadow-inner relative">
                  <img
                    src={form.image_url.trim() || fallbackImage}
                    alt="Dish Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.src = fallbackImage; }}
                  />
                  <div className="absolute top-2 right-2 rounded bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
                    Preview
                  </div>
                </div>

                <div className="w-full text-left">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-600">{form.category || "Category"}</span>
                  <h4 className="font-black text-slate-900 text-sm truncate">{form.item_name || "Dish Title"}</h4>
                  <p className="font-mono font-black text-emerald-700 text-base mt-1">
                    {form.price ? formatCurrency(form.price) : "₹0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {serverError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-700">
              ⚠️ {serverError}
            </div>
          )}

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary px-6 py-3 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-8 py-3 font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 shadow-lg"
            >
              {submitting ? "Transmitting..." : isEdit ? "Save Changes" : "Confirm & Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
