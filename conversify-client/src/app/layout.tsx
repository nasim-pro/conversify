export const metadata = {
  title: 'Conversify',
  description: 'A web chat specialist',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{margin: 0}}>{children}</body>
    </html>
  )
}
