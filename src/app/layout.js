import './globals.css';

export const metadata = {
  title: 'JalRakshak — Map Dirty Water Bodies, Organize Cleanups',
  description: 'Crowdsourced platform to map clean and dirty water bodies in Indian cities. Report trash, organize cleanup drives, connect with local groups.',
  openGraph: {
    title: 'JalRakshak',
    description: 'Map dirty water bodies. Organize cleanups. Clean your city.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
