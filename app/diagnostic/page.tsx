"use client"

import { PiDiagnostic } from "@/components/pi-diagnostic"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DiagnosticPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Diagnostic Pi Network</h1>
            <p className="text-sm text-muted-foreground">
              Vérification de la configuration et résolution des problèmes
            </p>
          </div>
        </div>
        
        <PiDiagnostic />
      </div>
    </div>
  )
}
