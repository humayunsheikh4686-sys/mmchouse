import './globals.css';

export const metadata = {
  title: 'Madina Mazda Cabin House | Auto Electrical & Interior Work',
  description:
    'Madina Mazda Cabin House focuses on Mazda cabin work, auto electrical repair, wiring, battery service, cushion fitting, car interior designing, and metal fabrication for doors, windows, and grills. We support M T-3000, M T-3500, and M T-4500 workshop needs.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}