import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:       "SWEENEX",
  description: "Real-time 3D human pose estimation via WiFi CSI",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
