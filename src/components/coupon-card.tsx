import { CheckCircle2, Copy } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CouponCardProps {
  code: string
  discount: string
  expiresAt: string
}

export function CouponCard({ code, discount, expiresAt }: CouponCardProps) {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Your Exclusive Coupon
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </CardTitle>
        <CardDescription>Use this code at checkout to get {discount} off</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border bg-muted p-3">
          <code className="text-lg font-semibold">{code}</code>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">Expires: {expiresAt}</p>
      </CardFooter>
    </Card>
  )
}

