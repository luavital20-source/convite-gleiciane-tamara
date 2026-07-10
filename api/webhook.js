import { MercadoPagoConfig, Payment } from 'mercadopago';

// Webhook de notificações do Mercado Pago. Loga o status do pagamento.
// Configure a URL deste endpoint em: Mercado Pago > Suas integrações > Webhooks.
export default async function handler(req, res) {
  // O MP espera resposta rápida 200/201. Sempre responda, mesmo em erro.
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    // Notificações do tipo "payment" trazem o id em data.id.
    const type = body.type || req.query?.type;
    const paymentId = body?.data?.id || req.query?.['data.id'] || req.query?.id;

    if (type === 'payment' && paymentId) {
      const accessToken = process.env.MP_ACCESS_TOKEN;
      if (accessToken) {
        const client = new MercadoPagoConfig({ accessToken });
        const payment = new Payment(client);
        const info = await payment.get({ id: paymentId });
        console.log('[webhook] pagamento', {
          id: info?.id,
          status: info?.status,
          external_reference: info?.external_reference,
          amount: info?.transaction_amount,
        });
      } else {
        console.warn('[webhook] MP_ACCESS_TOKEN ausente; não foi possível consultar o pagamento', paymentId);
      }
    } else {
      console.log('[webhook] notificação recebida:', JSON.stringify(body));
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook] erro:', err);
    // Responde 200 para evitar reenvios em loop por erros internos de log.
    return res.status(200).json({ received: true });
  }
}
