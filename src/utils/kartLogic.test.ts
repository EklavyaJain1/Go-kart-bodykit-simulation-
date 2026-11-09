import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateKartMetrics,
  DEFAULT_KART_CONFIG,
  ENGINE_SPECS,
  serializeConfig,
  deserializeConfig,
  PRESET_BUILDS,
  BASE_KART_PRICE,
} from './kartLogic';

test('calculateKartMetrics computes realistic performance and price for default F1 build', () => {
  const metrics = calculateKartMetrics(DEFAULT_KART_CONFIG);
  assert.ok(metrics.totalPriceUsd >= BASE_KART_PRICE);
  assert.ok(metrics.topSpeedMph >= 80 && metrics.topSpeedMph <= 130);
  assert.ok(metrics.zeroToSixtySec >= 2.0 && metrics.zeroToSixtySec <= 4.0);
  assert.ok(metrics.horsepower >= 35.0);
  assert.ok(metrics.handlingScore >= 70 && metrics.handlingScore <= 100);
  assert.ok(metrics.downforceScore >= 60 && metrics.downforceScore <= 100);
});

test('engine categories correctly affect horsepower and top speed', () => {
  const hybrid = calculateKartMetrics({ ...DEFAULT_KART_CONFIG, engine: 'f1_turbo_hybrid' });
  const diesel = calculateKartMetrics({ ...DEFAULT_KART_CONFIG, engine: 'diesel_turbo_torque' });
  const screamer = calculateKartMetrics({ ...DEFAULT_KART_CONFIG, engine: 'petrol_screamer_250' });

  assert.ok(hybrid.horsepower > diesel.horsepower);
  assert.ok(hybrid.topSpeedMph > diesel.topSpeedMph);
  assert.ok(screamer.horsepower > diesel.horsepower);
});

test('f1_grand_prix bodykit generates superior downforce', () => {
  const f1Kit = calculateKartMetrics({ ...DEFAULT_KART_CONFIG, bodykit: 'f1_grand_prix' });
  const brawlerKit = calculateKartMetrics({ ...DEFAULT_KART_CONFIG, bodykit: 'street_brawler' });

  assert.ok(f1Kit.downforceScore > brawlerKit.downforceScore);
  assert.ok(f1Kit.handlingScore > brawlerKit.handlingScore);
});

test('forged carbon material reduces weight and improves handling', () => {
  const forged = calculateKartMetrics({ ...DEFAULT_KART_CONFIG, material: 'forged_carbon' });
  const lacquer = calculateKartMetrics({ ...DEFAULT_KART_CONFIG, material: 'gloss_lacquer' });

  assert.ok(forged.totalWeightKg < lacquer.totalWeightKg);
  assert.ok(forged.handlingScore >= lacquer.handlingScore);
});

test('serialize and deserialize config correctly preserves all F1 components', () => {
  const custom = {
    ...DEFAULT_KART_CONFIG,
    bodyColor: '#DC2626',
    steeringKit: 'f1_oled_yoke' as const,
    exhaustMod: 'f1_titanium_center' as const,
    wheelSize: 'oversized_7in' as const,
  };

  const encoded = serializeConfig(custom);
  assert.ok(typeof encoded === 'string' && encoded.length > 10);

  const decoded = deserializeConfig(encoded);
  assert.ok(decoded !== null);
  assert.equal(decoded.steeringKit, 'f1_oled_yoke');
  assert.equal(decoded.exhaustMod, 'f1_titanium_center');
  assert.equal(decoded.wheelSize, 'oversized_7in');
});

test('all preset builds validate with complete engines and positive pricing', () => {
  for (const [key, preset] of Object.entries(PRESET_BUILDS)) {
    assert.ok(preset.name.length > 0, `Preset ${key} has name`);
    assert.ok(ENGINE_SPECS[preset.engine], `Preset ${key} has valid engine`);
    const metrics = calculateKartMetrics(preset);
    assert.ok(metrics.totalPriceUsd > 0);
  }
});
