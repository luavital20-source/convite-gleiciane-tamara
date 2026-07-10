// Fonte de verdade dos presentes (título e valor). NUNCA confie em valor vindo do cliente.
// O front-end envia apenas o giftId; título e unit_price são resolvidos aqui.
export const GIFTS = {
  1:  { title: 'Terapia das Noivas',                                unit_price: 250.00 },
  2:  { title: 'Curso Culinário',                                   unit_price: 140.00 },
  3:  { title: 'Vaquinha Pós Casamento',                            unit_price: 480.00 },
  4:  { title: 'Cobertor da Razão',                                 unit_price: 120.00 },
  5:  { title: 'Mira no Buquê',                                     unit_price: 200.00 },
  6:  { title: 'Parente Preferido',                                 unit_price: 600.00 },
  7:  { title: 'Amigos para Sempre',                                unit_price: 1000.00 },
  8:  { title: 'Lua de Mel',                                        unit_price: 420.00 },
  9:  { title: 'Aviãozinho',                                        unit_price: 200.00 },
  10: { title: 'Evidências no Palco',                               unit_price: 180.00 },
  11: { title: 'Presentinho Simples',                               unit_price: 120.00 },
  12: { title: 'Vale SPA para "Paz Pós-Briga"',                     unit_price: 300.00 },
  13: { title: 'Jogo de Cama, pra Dormir e Esquecer os Boletos',   unit_price: 120.00 },
  14: { title: 'Só pra Não Dizer que Não Dei Nada',                unit_price: 100.00 },
  15: { title: 'Uma Calça para uma Jovem de 16 Anos',              unit_price: 300.00 },
};

// Normaliza e valida um giftId recebido do cliente. Retorna o presente ou null.
export function getGift(giftId) {
  const id = Number(giftId);
  if (!Number.isInteger(id)) return null;
  const gift = GIFTS[id];
  if (!gift) return null;
  return { id, ...gift };
}
