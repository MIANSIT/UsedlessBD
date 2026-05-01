// Payload CMS admin layout – kept minimal; Payload manages its own styles
import React from 'react'
import '@payloadcms/next/css'

export default function PayloadAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
