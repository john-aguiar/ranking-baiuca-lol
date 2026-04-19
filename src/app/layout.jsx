
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'LoL Ranking',
  description: 'Ranking de partidas de League of Legends',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-900 text-white min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
