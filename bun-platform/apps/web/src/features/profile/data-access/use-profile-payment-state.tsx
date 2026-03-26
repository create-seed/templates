import { useQuery } from '@tanstack/react-query'

import { getPayment } from '@/lib/get-payment'

export function useProfilePaymentState() {
  return useQuery({
    queryFn: () => getPayment(),
    queryKey: ['profile', 'payment-state'],
  })
}
