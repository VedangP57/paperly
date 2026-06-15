import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign Up — Paperly',
  description: 'Create your Paperly account and start managing your work.',
  openGraph: {
    title: 'Sign Up — Paperly',
    description: 'Create your Paperly account and start managing your work.',
    images: ['/og-image.png'],
  },
}

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Get started with Paperly for free
          </p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
