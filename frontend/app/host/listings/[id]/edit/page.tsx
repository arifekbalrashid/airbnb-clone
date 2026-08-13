"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListing, updateListing } from "@/lib/api";
import { PROPERTY_TYPES, AMENITY_LIST } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    getListing(parseInt(id))
      .then((res) => {
        const l = res.data;
        setForm({
          title: l.title,
          description: l.description,
          property_type: l.property_type,
          location: l.location,
          city: l.city,
          country: l.country,
          price_per_night: String(l.price_per_night),
          max_guests: String(l.max_guests),
          bedrooms: String(l.bedrooms),
          beds: String(l.beds),
          bathrooms: String(l.bathrooms),
          image_urls: l.images.length > 0 ? l.images.map((img) => img.image_url) : [""],
          amenity_ids: l.amenities.map((a) => a.id),
        });
      })
      .catch(() => showToast("Listing not found", "error"))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleAmenity(aid: number) {
    setForm((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(aid) ? prev.amenity_ids.filter((a) => a !== aid) : [...prev.amenity_ids, aid],
    }));
  }

  function updateImageUrl(index: number, value: string) {
    setForm((prev) => { const urls = [...prev.image_urls]; urls[index] = value; return { ...prev, image_urls: urls }; });
  }

  function addImageField() {
    setForm((prev) => ({ ...prev, image_urls: [...prev.image_urls, ""] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateListing(parseInt(id), {
        ...form,
        price_per_night: parseFloat(form.price_per_night),
        max_guests: parseInt(form.max_guests),
        bedrooms: parseInt(form.bedrooms),
        beds: parseInt(form.beds),
        bathrooms: parseInt(form.bathrooms),
        image_urls: form.image_urls.filter((u) => u.trim()),
      });
      showToast("Listing updated!");
      router.push("/host/listings");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Update failed", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/2 mb-8" /><div className="h-96 bg-gray-200 rounded-xl" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Property Type</label>
            <select value={form.property_type} onChange={(e) => updateField("property_type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price / Night (₹)</label>
            <input type="number" value={form.price_per_night} onChange={(e) => updateField("price_per_night", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input type="text" value={form.location} onChange={(e) => updateField("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input type="text" value={form.city} onChange={(e) => updateField("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input type="text" value={form.country} onChange={(e) => updateField("country", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {["max_guests", "bedrooms", "beds", "bathrooms"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">{field.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</label>
              <input type="number" value={form[field as keyof typeof form] as string} onChange={(e) => updateField(field, e.target.value)} min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_LIST.map((a) => (
              <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  form.amenity_ids.includes(a.id) ? "bg-foreground text-white border-foreground" : "border-gray-200 hover:border-gray-400"
                }`}>{a.name}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Image URLs</label>
          {form.image_urls.map((url, i) => (
            <input key={i} type="url" value={url} onChange={(e) => updateImageUrl(i, e.target.value)} placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          ))}
          <button type="button" onClick={addImageField} className="text-xs text-primary hover:underline">+ Add another image</button>
        </div>
        <button type="submit" disabled={saving}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
