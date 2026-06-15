import Link from 'next/link'
import type { PublicBrand } from '@/components/layout/PublicShell'

const brandLabels: Record<PublicBrand, string> = {
  paperly: 'પેપરલી',
  cliently: 'Cliently',
}

const brandTaglines: Record<PublicBrand, string> = {
  paperly: 'છપાઈ માટે તૈયાર ગુજરાતી લેખ — લખો, સુધારો, કોપી કરો.',
  cliently: 'The all-in-one business OS for freelancers.',
}

export function PublicFooter({ brand = 'cliently' }: { brand?: PublicBrand }) {
  const brandName = brandLabels[brand]

  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-bold text-xl tracking-tight">
              {brandName}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {brandTaglines[brand]}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
