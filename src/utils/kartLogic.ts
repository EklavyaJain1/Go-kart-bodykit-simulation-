/**
 * Go-Kart Configuration and Performance Engine
 * Apex Kartworks - Core Logic (Formula 1 Inspired Upgrade)
 */

export type BodykitStyle = 'f1_grand_prix' | 'f1_ground_effect' | 'street_brawler' | 'cyber_gp';
export type BodyMaterial = 'forged_carbon' | 'twill_carbon' | 'billet_metal' | 'titanium_sheen' | 'gloss_lacquer' | 'stealth_matte';
export type WheelSize = 'standard_5in' | 'lowprofile_6in' | 'oversized_7in' | 'chunky_dirt';
export type TireWidth = 'staggered_f1' | 'standard_race' | 'drift_flush';
export type TireType = 'slick_racing' | 'wet_grooved' | 'dirt_knobby' | 'drift_hard';
export type RimStyle = 'bbs_mesh' | 'carbon_dish' | 'turbofan' | 'spoke5';
export type RearWingType = 'f1_drs_wing' | 'sprint_vortex' | 'gt_carbon' | 'ducktail' | 'none';
export type EngineType = 'f1_turbo_hybrid' | 'petrol_screamer_250' | 'petrol_bigbore_420' | 'electric_flux_25kw' | 'diesel_turbo_torque';
export type SteeringKit = 'f1_oled_yoke' | 'd_cut_alcantara' | 'butterfly_race' | 'open_yoke_titanium';
export type SeatKit = 'f1_carbon_monocoque' | 'fia_padded_bucket' | 'alcantara_diamond' | 'poly_lightweight';
export type ExhaustMod = 'f1_titanium_center' | 'tuned_pipe_loop' | 'sidepod_flamethrower' | 'quad_carbon_tips' | 'ev_silent_diffuser';
export type UnderglowColor = 'none' | 'red' | 'white' | 'cyan' | 'amber';

export interface KartConfig {
  name: string;
  bodyColor: string;
  accentColor: string;
  material: BodyMaterial;
  raceNumber: string;
  bodykit: BodykitStyle;
  rearWing: RearWingType;
  wheelSize: WheelSize;
  tireWidth: TireWidth;
  tireType: TireType;
  rimStyle: RimStyle;
  rimColor: string;
  caliperColor: string;
  engine: EngineType;
  steeringKit: SteeringKit;
  seatKit: SeatKit;
  exhaustMod: ExhaustMod;
  underglow: UnderglowColor;
  headlightColor: string;
}

export interface EngineSpec {
  name: string;
  category: 'F1 Hybrid' | 'Petrol' | 'Electric' | 'Diesel';
  displacement: string;
  hp: number;
  torqueNm: number;
  topSpeedMph: number;
  zeroToSixtySec: number;
  weightKg: number;
  priceUsd: number;
  badge: string;
  description: string;
  soundProfile: 'f1_v6_hybrid' | 'f1_screamer' | 'petrol_4stroke' | 'electric_warp' | 'diesel_turbo';
}

export const ENGINE_SPECS: Record<EngineType, EngineSpec> = {
  f1_turbo_hybrid: {
    name: 'Apex F1 Turbo-Hybrid ERS',
    category: 'F1 Hybrid',
    displacement: '350cc Turbo V-Twin + 12kW MGU-K KERS',
    hp: 48.0,
    torqueNm: 72,
    topSpeedMph: 105,
    zeroToSixtySec: 2.6,
    weightKg: 98,
    priceUsd: 3450,
    badge: 'F1 HYBRID SPEC',
    description: 'Electric Kinetic Energy Recovery (ERS/KERS) paired with high-boost ceramic turbo.',
    soundProfile: 'f1_v6_hybrid',
  },
  petrol_screamer_250: {
    name: 'Apex GP Screamer 250 Twin',
    category: 'Petrol',
    displacement: '250cc Twin-Cylinder 2-Stroke (14,000 RPM)',
    hp: 38.0,
    torqueNm: 44,
    topSpeedMph: 94,
    zeroToSixtySec: 3.1,
    weightKg: 79,
    priceUsd: 1950,
    badge: 'HIGH-RPM PETROL',
    description: 'Screaming racing 2-stroke twin with tuned dual expansion chambers and slide carbs.',
    soundProfile: 'f1_screamer',
  },
  petrol_bigbore_420: {
    name: 'Vortex 420cc Big Bore OHV',
    category: 'Petrol',
    displacement: '420cc 4-Stroke Balanced Crank',
    hp: 24.0,
    torqueNm: 36,
    topSpeedMph: 74,
    zeroToSixtySec: 4.1,
    weightKg: 88,
    priceUsd: 850,
    badge: 'TORQUE PETROL',
    description: 'Reliable high-torque big bore single with forged internals and velocity stack.',
    soundProfile: 'petrol_4stroke',
  },
  electric_flux_25kw: {
    name: 'VoltX Dual Flux 25kW EV',
    category: 'Electric',
    displacement: 'Dual AC Permanent Magnet + 96V LiFePO4',
    hp: 42.0,
    torqueNm: 84,
    topSpeedMph: 92,
    zeroToSixtySec: 2.7,
    weightKg: 86,
    priceUsd: 2600,
    badge: 'PURE EV TORQUE',
    description: 'Instant zero-RPM peak torque delivery with liquid cooling and regenerative braking.',
    soundProfile: 'electric_warp',
  },
  diesel_turbo_torque: {
    name: 'Duramaxx 300cc Turbo-Diesel',
    category: 'Diesel',
    displacement: '300cc Common-Rail Intercooled Turbo-Diesel',
    hp: 26.0,
    torqueNm: 82,
    topSpeedMph: 70,
    zeroToSixtySec: 3.9,
    weightKg: 108,
    priceUsd: 1250,
    badge: 'ENDURANCE DIESEL',
    description: 'High thermal efficiency, immense low-end torque for relentless acceleration.',
    soundProfile: 'diesel_turbo',
  },
};

export const BASE_KART_PRICE = 3200;

export const UPGRADE_PRICING = {
  bodykit: {
    f1_grand_prix: 950,
    f1_ground_effect: 820,
    street_brawler: 450,
    cyber_gp: 580,
  },
  material: {
    forged_carbon: 650,
    twill_carbon: 450,
    billet_metal: 350,
    titanium_sheen: 520,
    gloss_lacquer: 0,
    stealth_matte: 180,
  },
  rearWing: {
    f1_drs_wing: 680,
    sprint_vortex: 460,
    gt_carbon: 380,
    ducktail: 140,
    none: 0,
  },
  wheelSize: {
    standard_5in: 0,
    lowprofile_6in: 320,
    oversized_7in: 450,
    chunky_dirt: 280,
  },
  tireWidth: {
    staggered_f1: 290,
    standard_race: 0,
    drift_flush: 150,
  },
  tireType: {
    slick_racing: 0,
    wet_grooved: 140,
    dirt_knobby: 180,
    drift_hard: 210,
  },
  rimStyle: {
    bbs_mesh: 280,
    carbon_dish: 420,
    turbofan: 360,
    spoke5: 0,
  },
  steeringKit: {
    f1_oled_yoke: 550,
    d_cut_alcantara: 320,
    butterfly_race: 0,
    open_yoke_titanium: 440,
  },
  seatKit: {
    f1_carbon_monocoque: 580,
    fia_padded_bucket: 360,
    alcantara_diamond: 390,
    poly_lightweight: 0,
  },
  exhaustMod: {
    f1_titanium_center: 480,
    tuned_pipe_loop: 320,
    sidepod_flamethrower: 420,
    quad_carbon_tips: 380,
    ev_silent_diffuser: 0,
  },
  underglow: {
    none: 0,
    red: 95,
    white: 95,
    cyan: 110,
    amber: 95,
  },
};

export interface CalculatedPerformance {
  topSpeedMph: number;
  zeroToSixtySec: number;
  horsepower: number;
  handlingScore: number; // 0-100
  downforceScore: number; // 0-100
  powerToWeightRatio: number; // hp / 100kg
  totalWeightKg: number;
  totalPriceUsd: number;
}

export function calculateKartMetrics(config: KartConfig): CalculatedPerformance {
  const engine = ENGINE_SPECS[config.engine] || ENGINE_SPECS.f1_turbo_hybrid;

  let baseWeight = engine.weightKg;
  let topSpeed = engine.topSpeedMph;
  let accelTime = engine.zeroToSixtySec;
  let downforce = 20;
  let handling = 48;

  // Bodykit Impact (F1 aerodynamic aero)
  if (config.bodykit === 'f1_grand_prix') {
    downforce += 36;
    handling += 16;
    topSpeed += 5;
    baseWeight += 5;
  } else if (config.bodykit === 'f1_ground_effect') {
    downforce += 32;
    handling += 14;
    topSpeed += 4;
    baseWeight += 4;
  } else if (config.bodykit === 'cyber_gp') {
    downforce += 20;
    handling += 10;
    topSpeed += 3;
    baseWeight += 6;
  } else if (config.bodykit === 'street_brawler') {
    downforce += 12;
    handling += 6;
    baseWeight += 4;
  }

  // Material weight impact
  if (config.material === 'forged_carbon') {
    baseWeight -= 6.5;
    handling += 4;
  } else if (config.material === 'twill_carbon') {
    baseWeight -= 4.0;
    handling += 2;
  } else if (config.material === 'titanium_sheen') {
    baseWeight -= 2.0;
  }

  // Rear Wing Impact
  if (config.rearWing === 'f1_drs_wing') {
    downforce += 28;
    handling += 10;
    topSpeed -= 1;
    baseWeight += 4.5;
  } else if (config.rearWing === 'sprint_vortex') {
    downforce += 22;
    handling += 8;
    topSpeed -= 2;
    baseWeight += 4;
  } else if (config.rearWing === 'gt_carbon') {
    downforce += 16;
    handling += 5;
    baseWeight += 3;
  } else if (config.rearWing === 'ducktail') {
    downforce += 6;
    handling += 2;
    baseWeight += 1;
  }

  // Wheel Size & Stance Impact
  if (config.wheelSize === 'lowprofile_6in') {
    handling += 6;
    accelTime -= 0.1;
  } else if (config.wheelSize === 'oversized_7in') {
    topSpeed += 3;
    baseWeight += 3;
  } else if (config.wheelSize === 'chunky_dirt') {
    handling -= 6;
    topSpeed -= 4;
  }

  if (config.tireWidth === 'staggered_f1') {
    downforce += 6;
    handling += 8;
    accelTime -= 0.15;
  }

  // Tire compound impact
  if (config.tireType === 'slick_racing') {
    handling += 8;
    accelTime -= 0.12;
  } else if (config.tireType === 'drift_hard') {
    handling -= 10;
    topSpeed += 2;
  }

  // Clamp metrics
  const finalTopSpeed = Math.round(Math.max(40, topSpeed));
  const finalAccel = Math.max(1.9, Math.round(accelTime * 10) / 10);
  const finalHandling = Math.min(99, Math.max(40, Math.round(handling)));
  const finalDownforce = Math.min(99, Math.max(15, Math.round(downforce)));
  const powerToWeight = Math.round((engine.hp / (baseWeight / 100)) * 10) / 10;

  // Calculate price
  let totalPrice = BASE_KART_PRICE + engine.priceUsd;
  totalPrice += UPGRADE_PRICING.bodykit[config.bodykit] || 0;
  totalPrice += UPGRADE_PRICING.material[config.material] || 0;
  totalPrice += UPGRADE_PRICING.rearWing[config.rearWing] || 0;
  totalPrice += UPGRADE_PRICING.wheelSize[config.wheelSize] || 0;
  totalPrice += UPGRADE_PRICING.tireWidth[config.tireWidth] || 0;
  totalPrice += UPGRADE_PRICING.tireType[config.tireType] || 0;
  totalPrice += UPGRADE_PRICING.rimStyle[config.rimStyle] || 0;
  totalPrice += UPGRADE_PRICING.steeringKit[config.steeringKit] || 0;
  totalPrice += UPGRADE_PRICING.seatKit[config.seatKit] || 0;
  totalPrice += UPGRADE_PRICING.exhaustMod[config.exhaustMod] || 0;
  totalPrice += UPGRADE_PRICING.underglow[config.underglow] || 0;

  return {
    topSpeedMph: finalTopSpeed,
    zeroToSixtySec: finalAccel,
    horsepower: engine.hp,
    handlingScore: finalHandling,
    downforceScore: finalDownforce,
    powerToWeightRatio: powerToWeight,
    totalWeightKg: Math.round(baseWeight),
    totalPriceUsd: totalPrice,
  };
}

export const DEFAULT_KART_CONFIG: KartConfig = {
  name: 'Apex F1 Corsa GP',
  bodyColor: '#DC2626', // Apex Red
  accentColor: '#FFFFFF', // Secondary White
  material: 'forged_carbon',
  raceNumber: '01',
  bodykit: 'f1_grand_prix',
  rearWing: 'f1_drs_wing',
  wheelSize: 'lowprofile_6in',
  tireWidth: 'staggered_f1',
  tireType: 'slick_racing',
  rimStyle: 'bbs_mesh',
  rimColor: '#111113', // Obsidian black
  caliperColor: '#DC2626',
  engine: 'f1_turbo_hybrid',
  steeringKit: 'f1_oled_yoke',
  seatKit: 'f1_carbon_monocoque',
  exhaustMod: 'f1_titanium_center',
  underglow: 'red',
  headlightColor: '#FFFFFF',
};

export const PRESET_BUILDS: Record<string, KartConfig> = {
  f1_championship: {
    name: 'Apex F1 Scuderia',
    bodyColor: '#DC2626',
    accentColor: '#FFFFFF',
    material: 'forged_carbon',
    raceNumber: '01',
    bodykit: 'f1_grand_prix',
    rearWing: 'f1_drs_wing',
    wheelSize: 'lowprofile_6in',
    tireWidth: 'staggered_f1',
    tireType: 'slick_racing',
    rimStyle: 'bbs_mesh',
    rimColor: '#111113',
    caliperColor: '#DC2626',
    engine: 'f1_turbo_hybrid',
    steeringKit: 'f1_oled_yoke',
    seatKit: 'f1_carbon_monocoque',
    exhaustMod: 'f1_titanium_center',
    underglow: 'red',
    headlightColor: '#FFFFFF',
  },
  shadow_screamer: {
    name: 'Shadow Screamer 250',
    bodyColor: '#111113',
    accentColor: '#DC2626',
    material: 'twill_carbon',
    raceNumber: '99',
    bodykit: 'f1_ground_effect',
    rearWing: 'sprint_vortex',
    wheelSize: 'oversized_7in',
    tireWidth: 'drift_flush',
    tireType: 'drift_hard',
    rimStyle: 'carbon_dish',
    rimColor: '#DC2626',
    caliperColor: '#FFFFFF',
    engine: 'petrol_screamer_250',
    steeringKit: 'd_cut_alcantara',
    seatKit: 'fia_padded_bucket',
    exhaustMod: 'tuned_pipe_loop',
    underglow: 'amber',
    headlightColor: '#EF4444',
  },
  voltx_titanium: {
    name: 'VoltX Cyber Formula',
    bodyColor: '#FFFFFF',
    accentColor: '#06B6D4',
    material: 'titanium_sheen',
    raceNumber: '77',
    bodykit: 'cyber_gp',
    rearWing: 'f1_drs_wing',
    wheelSize: 'lowprofile_6in',
    tireWidth: 'staggered_f1',
    tireType: 'slick_racing',
    rimStyle: 'turbofan',
    rimColor: '#FFFFFF',
    caliperColor: '#06B6D4',
    engine: 'electric_flux_25kw',
    steeringKit: 'open_yoke_titanium',
    seatKit: 'f1_carbon_monocoque',
    exhaustMod: 'ev_silent_diffuser',
    underglow: 'cyan',
    headlightColor: '#00E5FF',
  },
  diesel_endurance: {
    name: 'Ironclad Turbo-Diesel',
    bodyColor: '#475569',
    accentColor: '#F59E0B',
    material: 'billet_metal',
    raceNumber: '44',
    bodykit: 'street_brawler',
    rearWing: 'gt_carbon',
    wheelSize: 'oversized_7in',
    tireWidth: 'standard_race',
    tireType: 'wet_grooved',
    rimStyle: 'spoke5',
    rimColor: '#111113',
    caliperColor: '#F59E0B',
    engine: 'diesel_turbo_torque',
    steeringKit: 'd_cut_alcantara',
    seatKit: 'alcantara_diamond',
    exhaustMod: 'sidepod_flamethrower',
    underglow: 'amber',
    headlightColor: '#FFFFFF',
  },
};

export function serializeConfig(config: KartConfig): string {
  try {
    return btoa(JSON.stringify(config));
  } catch {
    return '';
  }
}

export function deserializeConfig(encoded: string): KartConfig | null {
  try {
    const parsed = JSON.parse(atob(encoded));
    if (parsed && typeof parsed === 'object' && parsed.bodyColor) {
      return { ...DEFAULT_KART_CONFIG, ...parsed };
    }
    return null;
  } catch {
    return null;
  }
}
