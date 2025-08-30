import { EmailTest } from "@/components/admin/email-test"

export default function EmailTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Service Test</h1>
          <p className="text-muted-foreground">
            Test and configure email notifications for the CoastCare alert system.
          </p>
        </div>
        
        <EmailTest />
      </div>
    </div>
  )
}
