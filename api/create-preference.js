import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getGift } from './_gifts.js';

// Define os headers de CORS. Libera o domínio do site (SITE_URL) ou * como fallback.
function setCors(res) {
  const origin = process.env.SITE_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  setCors(res);

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    // req.body pode vir como objeto (Vercel faz o parse de JSON) ou string.
    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    } catch {
      return res.status(400).json({ error: 'Corpo da requisição inválido.' });
    }
    const { giftId } = body;

    // Valida o giftId contra o mapa (fonte de verdade no back-end). Cliente inválido = 400.
    const gift = getGift(giftId);
    if (!gift) {
      return res.status(400).json({ error: 'Presente inválido.' });
    }

    // Config do servidor só é checada depois de validar a requisição do cliente.
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MP_ACCESS_TOKEN não configurado no ambiente.');
      return res.status(500).json({ error: 'Configuração de pagamento ausente.' });
    }

    // URL base do site para os retornos do checkout.
    const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const preferenceBody = {
      items: [
        {
          id: String(gift.id),
          title: gift.title,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: gift.unit_price,
        },
      ],
      external_reference: String(gift.id),
      metadata: { gift_id: gift.id, gift_title: gift.title },
      statement_descriptor: 'PRESENTE CASAMENTO',
    };

    // back_urls + auto_return só funcionam com uma URL pública válida.
    if (siteUrl) {
      preferenceBody.back_urls = {
        success: `${siteUrl}/?pagamento=sucesso`,
        pending: `${siteUrl}/?pagamento=pendente`,
        failure: `${siteUrl}/?pagamento=falha`,
      };
      preferenceBody.auto_return = 'approved';
    }

    const result = await preference.create({ body: preferenceBody });

    // init_point é a URL de checkout de produção.
    const initPoint = result?.init_point;
    if (!initPoint) {
      console.error('Preference criada sem init_point:', result);
      return res.status(502).json({ error: 'Falha ao criar o pagamento.' });
    }

    return res.status(200).json({ init_point: initPoint });
  } catch (err) {
    console.error('Erro ao criar preference:', err);
    return res.status(500).json({ error: 'Erro ao processar o pagamento.' });
  }
}
