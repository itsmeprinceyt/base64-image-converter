import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Loader from './(components)/Loader';

export const metadata: Metadata = {
  title: "Base64 Image Converter by ItsMe Prince",
  description: "The Base64 Image Converter by ItsMe Prince allows you to easily convert images into base64 strings for use in your applications. Simply upload an image and get the corresponding base64 representation.",
  icons: {
    icon: "/logo/base64-converter-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<Loader />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
