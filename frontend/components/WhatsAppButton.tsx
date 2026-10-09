'use client';

// Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env (international format, digits only, e.g. 8801XXXXXXXXX).
export default function WhatsAppButton() {
  const n = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!n) return null;
  const href = `https://wa.me/${n}?text=${encodeURIComponent('Hello Parbatya Travels BD, I need help planning a trip.')}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
       className="fixed right-4 bottom-20 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg md:bottom-6">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 20.5l1.4-4.3A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1z" />
        <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-.8.8c-1-.4-1.8-1.2-2.2-2.2l.8-.8-1-2z" />
      </svg>
    </a>
  );
}
