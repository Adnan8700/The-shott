import { supabase } from '@/lib/supabase';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function verifyPaymentWebhook(
  participantId: string,
  paymentReference: string,
  paymentAmount: string,
  signature?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${EDGE_FUNCTION_URL}/payment-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        participant_id: participantId,
        payment_reference: paymentReference,
        payment_amount: paymentAmount,
        signature,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error || `Request failed (${response.status})` };
    }

    const data = await response.json();
    return { success: !!data.success };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function checkPaymentStatus(participantId: string): Promise<boolean> {
  const { data } = await supabase
    .from('participants')
    .select('payment_verified')
    .eq('participant_id', participantId)
    .maybeSingle();
  return !!data?.payment_verified;
}
