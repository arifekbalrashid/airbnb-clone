"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/api";
import { PROPERTY_TYPES, AMENITY_LIST } from "@/types";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

export default function NewListingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: "",
    description: "",
    property_type: "apartment",
    location: "",
    city: "",
    country: "India",
    price_per_night: "",
    max_guests: "2",
    bedrooms: "1",
    beds: "1",
    bathrooms: "1",
    image_urls: [""],
    amenity_ids: [] as number[],
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleAmenity(id: number) {
    setForm((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(id)
        ? prev.amenity_ids.filter((a) => a !== id)
        : [...prev.amenity_ids, id],
    }));
  }

  function updateImageUrl(index: number, value: string) {
    setForm((prev) => {
      const urls = [...prev.image_urls];
      urls[index] = value;
      return { ...prev, image_urls: urls };
    });
  }

  function addImageField() {
    setForm((prev) => ({ ...prev, image_urls: [...prev.image_urls, ""] }));
  }

  async function handleSubmit() {
    if (!form.title || !form.description || !form.location || !form.city || !form.price_per_night) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setLoading(true);
    try {
      await createListing({
        ...form,
        price_per_night: parseFloat(form.price_per_night),
        max_guests: parseInt(form.max_guests),
        bedrooms: parseInt(form.bedrooms),
        beds: parseInt(form.beds),
        bathrooms: parseInt(form.bathrooms),
        image_urls: form.image_urls.filter((u) => u.trim()),
      });
      showToast("Listing created!");
      router.push("/host/listings");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Create failed", "error");
    } finally {
      setLoading(false);
    }
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-white">
      {/* Left side: Form steps */}
      <div className="w-1/2 flex flex-col justify-between p-12 overflow-y-auto">
        <div>
          <div className="mb-8">
            <Link href="/host/listings" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Exit
            </Link>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
              {step === 1 && "Tell us about your place"}
              {step === 2 && "Where is your place located?"}
              {step === 3 && "Share some basics about your place"}
              {step === 4 && "Add photos and amenities"}
            </h1>
          </div>

          <div className="space-y-6">
            {step === 1 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <div>
                  <label className="block text-lg font-medium mb-2 text-gray-700">Title</label>
                  <p className="text-sm text-gray-500 mb-4">Short titles work best. Have fun with it—you can always change it later.</p>
                  <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. Cozy apartment with sea view"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
                </div>
                <div className="mt-8">
                  <label className="block text-lg font-medium mb-2 text-gray-700">Description</label>
                  <p className="text-sm text-gray-500 mb-4">Share what makes your place special.</p>
                  <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={5}
                    placeholder="e.g. You'll have a great time at this comfortable place to stay."
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
                </div>
                <div className="mt-8">
                  <label className="block text-lg font-medium mb-2 text-gray-700">Property Type</label>
                  <select value={form.property_type} onChange={(e) => updateField("property_type", e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white">
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <div>
                  <label className="block text-lg font-medium mb-2 text-gray-700">Location</label>
                  <p className="text-sm text-gray-500 mb-4">Where's your place located?</p>
                  <input type="text" value={form.location} onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g. 123 Main St, Area"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-base font-medium mb-2 text-gray-700">City</label>
                    <input type="text" value={form.city} onChange={(e) => updateField("city", e.target.value)}
                      placeholder="City"
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2 text-gray-700">Country</label>
                    <input type="text" value={form.country} onChange={(e) => updateField("country", e.target.value)}
                      placeholder="Country"
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-[fadeIn_0.4s_ease-out] space-y-8">
                <div>
                  <label className="block text-lg font-medium mb-2 text-gray-700">Price per night (₹)</label>
                  <p className="text-sm text-gray-500 mb-4">You can change it anytime.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-gray-500">₹</span>
                    <input type="number" value={form.price_per_night} onChange={(e) => updateField("price_per_night", e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl text-xl font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {[
                    { id: "max_guests", label: "Guests" },
                    { id: "bedrooms", label: "Bedrooms" },
                    { id: "beds", label: "Beds" },
                    { id: "bathrooms", label: "Bathrooms" },
                  ].map((field) => (
                    <div key={field.id} className="flex items-center justify-between py-4 border-b border-gray-100">
                      <span className="text-lg text-gray-700">{field.label}</span>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => updateField(field.id, Math.max(1, parseInt(form[field.id as keyof typeof form] as string) - 1).toString())}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-black hover:text-black transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                        <span className="w-4 text-center text-lg">{form[field.id as keyof typeof form]}</span>
                        <button
                          type="button"
                          onClick={() => updateField(field.id, (parseInt(form[field.id as keyof typeof form] as string) + 1).toString())}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-black hover:text-black transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-[fadeIn_0.4s_ease-out]">
                <div className="mb-8">
                  <label className="block text-lg font-medium mb-4 text-gray-700">What amenities do you offer?</label>
                  <div className="grid grid-cols-2 gap-4">
                    {AMENITY_LIST.map((a) => (
                      <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.amenity_ids.includes(a.id) ? "border-black bg-gray-50" : "border-gray-200 hover:border-black"
                        }`}>
                        <span className="font-medium">{a.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium mb-4 text-gray-700">Add some photos</label>
                  {form.image_urls.map((url, i) => (
                    <input key={i} type="url" value={url} onChange={(e) => updateImageUrl(i, e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
                  ))}
                  <button type="button" onClick={addImageField} className="mt-2 text-sm font-medium text-black underline underline-offset-2 hover:text-gray-600">
                    + Add another photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="pt-8 border-t border-gray-100 flex items-center justify-between mt-auto">
          <button
            onClick={prevStep}
            className={`font-medium underline transition-opacity ${step === 1 ? "opacity-0 pointer-events-none" : "opacity-100 hover:text-gray-600"}`}
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={loading}
            className="px-8 py-3 bg-[#E51E5B] text-white rounded-lg font-medium text-lg hover:bg-[#D70466] transition-colors disabled:opacity-50"
          >
            {step === 4 ? (loading ? "Saving..." : "Create Listing") : "Next"}
          </button>
        </div>
      </div>

      {/* Right side: Animation */}
      <div className="w-1/2 bg-[#f7f7f7] flex flex-col items-center justify-center p-12 relative overflow-hidden border-l border-gray-100">
        <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center transition-transform duration-1000 ease-out"
             style={{ transform: `scale(${1 + (step - 1) * 0.05})` }}>
          
          <img
            src="/images/setup-house.png"
            alt="3D House Model"
            className="w-full h-full object-contain transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              clipPath: 
                step === 1 ? "inset(70% 0 0 0)" :
                step === 2 ? "inset(45% 0 0 0)" :
                step === 3 ? "inset(20% 0 0 0)" :
                "inset(0 0 0 0)",
              transform:
                step === 1 ? "translateY(10%)" :
                step === 2 ? "translateY(5%)" :
                step === 3 ? "translateY(2%)" :
                "translateY(0%)",
              opacity: step === 1 ? 0.8 : 1
            }}
          />
        </div>
      </div>
    </div>
  );
}
