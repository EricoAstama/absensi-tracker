import type { Metadata } from "next"; import "./globals.css";
export const metadata:Metadata={title:"Hadir — Absensi Kantor",description:"Sistem absensi empat slot dengan selfie dan geofencing"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}
