"use client";

import { useCurrency, Currency } from "@/context/CurrencyContext";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencies: { code: Currency; name: string; symbol: string }[] = [
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
];

export default function CurrencyModal({ isOpen, onClose }: CurrencyModalProps) {
  const { currency, setCurrency } = useCurrency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden p-6">
        <div className="flex items-center mb-6">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors mr-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold">Language and region</h2>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Choose a currency</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  onClose();
                }}
                className={`flex flex-col items-start p-3 rounded-lg hover:bg-gray-50 transition-colors border ${
                  currency === c.code ? "border-black bg-gray-50" : "border-transparent"
                }`}
              >
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-sm text-gray-500">{c.code} - {c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
