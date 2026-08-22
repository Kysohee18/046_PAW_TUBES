import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#09090b',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="40" height="40" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#18181b" />
            <path d="M4 17 H10 L13 9 L18 24 L21 17 H28" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ color: '#ffffff', fontSize: 32, fontWeight: 700 }}>ReviewPulse</div>
        </div>
        <div style={{ color: '#ffffff', fontSize: 60, fontWeight: 800, marginTop: 48, lineHeight: 1.15, maxWidth: 980 }}>
          Product Flaw Intelligence for E-Commerce Sellers
        </div>
        <div style={{ color: '#a1a1aa', fontSize: 28, marginTop: 28, maxWidth: 900 }}>
          AI-powered review analysis, CSAT scoring, and fix checklists via a REST API.
        </div>
      </div>
    ),
    { ...size }
  );
}
