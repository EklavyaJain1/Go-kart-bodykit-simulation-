import React, { useState } from 'react';
import { X, CheckCircle2, Printer, Sparkles, ShieldCheck, Truck, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  KartConfig,
  CalculatedPerformance,
  ENGINE_SPECS,
  BASE_KART_PRICE,
  UPGRADE_PRICING,
} from '../../utils/kartLogic';
import { sound } from '../../utils/soundEngine';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: KartConfig;
  metrics: CalculatedPerformance;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  config,
  metrics,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customPlaque, setCustomPlaque] = useState(`CHASSIS #${config.raceNumber || '07'} - APEX FACTORY`);
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>('deposit');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');

  if (!isOpen) return null;

  const engine = ENGINE_SPECS[config.engine] || ENGINE_SPECS.f1_turbo_hybrid;
  const depositAmount = Math.round(metrics.totalPriceUsd * 0.25);

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playEquip();

    const randomSerial = `AK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setSerialNumber(randomSerial);
    setOrderConfirmed(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DC2626', '#FFFFFF', '#111113'],
      });
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-none select-none overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#0D0E14] border-2 border-red-600/50 rounded-2xl shadow-2xl p-5 sm:p-7 text-white my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#181922] hover:bg-[#252634] text-zinc-400 hover:text-white transition-colors"
          aria-label="Close Order Sheet"
        >
          <X className="w-5 h-5" />
        </button>

        {orderConfirmed ? (
          /* Confirmation Screen */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 border border-red-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="inline-block px-3 py-1 rounded bg-[#1B1D28] text-red-400 font-mono text-xs font-bold uppercase tracking-widest mb-2 border border-red-500/30">
              BUILD ORDER RESERVED
            </span>

            <h2 id="order-modal-title" className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
              Chassis In Production
            </h2>

            <p className="text-sm text-zinc-300 max-w-md mx-auto mb-6">
              Thank you, <strong className="text-white">{customerName || 'Driver'}</strong>. Your custom go-kart specifications have been registered with the Apex factory engineering team.
            </p>

            <div className="bg-[#14151E] p-4 rounded-xl border border-[#262838] max-w-md mx-auto text-left font-mono text-xs space-y-2 mb-6">
              <div className="flex justify-between border-b border-[#242636] pb-2">
                <span className="text-zinc-400">ASSIGNED SERIAL:</span>
                <span className="text-white font-bold text-sm text-red-500">{serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">RACE SPEC:</span>
                <span className="text-white font-bold">{config.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">ENGRAVING:</span>
                <span className="text-white font-bold">{customPlaque}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">ESTIMATED LEAD TIME:</span>
                <span className="text-white font-bold">14 - 21 Business Days</span>
              </div>
              <div className="flex justify-between border-t border-[#242636] pt-2 text-sm">
                <span className="text-zinc-400">
                  {paymentOption === 'deposit' ? '25% RESERVATION DEPOSIT:' : 'FULL PAYMENT TOTAL:'}
                </span>
                <span className="text-white font-black">
                  ${(paymentOption === 'deposit' ? depositAmount : metrics.totalPriceUsd).toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B1D28] hover:bg-[#252838] text-white font-bold text-xs uppercase tracking-wider border border-[#32364A] transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Spec Sheet
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-950/60"
              >
                Back To Garage
              </button>
            </div>
          </div>
        ) : (
          /* Order & Build Specification Form */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center font-black text-white text-xl">
                AK
              </div>
              <div>
                <h2 id="order-modal-title" className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Factory Build Sheet & Order
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  CUSTOM MANUFACTURER CONTRACT • SPECIFICATION REV 4.2
                </p>
              </div>
            </div>

            {/* Itemized Specification Grid */}
            <div className="bg-[#12131A] rounded-xl p-4 border border-[#22232E] mb-5 font-mono text-xs">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-[#242636] pb-2 mb-3">
                Itemized Technical Components
              </div>

              <div className="space-y-1.5 text-zinc-300">
                <div className="flex justify-between">
                  <span>Base Chassis Frame (Tubular Chrome-Moly CIK-FIA)</span>
                  <span className="text-white font-bold">${BASE_KART_PRICE.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Engine: {engine.name} ({engine.hp} HP)</span>
                  <span className="text-white font-bold">
                    {engine.priceUsd === 0 ? 'INCLUDED' : `+$${engine.priceUsd}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Bodykit Style: {config.bodykit.toUpperCase()}</span>
                  <span className="text-white font-bold">
                    {UPGRADE_PRICING.bodykit[config.bodykit] === 0
                      ? 'INCLUDED'
                      : `+$${UPGRADE_PRICING.bodykit[config.bodykit]}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Rear Downforce Aero: {config.rearWing.toUpperCase()}</span>
                  <span className="text-white font-bold">
                    {UPGRADE_PRICING.rearWing[config.rearWing] === 0
                      ? 'INCLUDED'
                      : `+$${UPGRADE_PRICING.rearWing[config.rearWing]}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tire Package: {config.tireType.toUpperCase()}</span>
                  <span className="text-white font-bold">
                    {UPGRADE_PRICING.tireType[config.tireType] === 0
                      ? 'INCLUDED'
                      : `+$${UPGRADE_PRICING.tireType[config.tireType]}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Rim Forging: {config.rimStyle.toUpperCase()}</span>
                  <span className="text-white font-bold">
                    {UPGRADE_PRICING.rimStyle[config.rimStyle] === 0
                      ? 'INCLUDED'
                      : `+$${UPGRADE_PRICING.rimStyle[config.rimStyle]}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Material Composition: {config.material.toUpperCase().replace(/_/g, ' ')}</span>
                  <span className="text-white font-bold">
                    {UPGRADE_PRICING.material[config.material] === 0
                      ? 'INCLUDED'
                      : `+$${UPGRADE_PRICING.material[config.material]}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Wheel & Tire Size: {config.wheelSize.toUpperCase().replace(/_/g, ' ')} ({config.tireWidth.toUpperCase().replace(/_/g, ' ')})</span>
                  <span className="text-white font-bold">
                    {(UPGRADE_PRICING.wheelSize[config.wheelSize] + UPGRADE_PRICING.tireWidth[config.tireWidth]) === 0
                      ? 'INCLUDED'
                      : `+$${UPGRADE_PRICING.wheelSize[config.wheelSize] + UPGRADE_PRICING.tireWidth[config.tireWidth]}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Steering Kit: {config.steeringKit.toUpperCase().replace(/_/g, ' ')}</span>
                  <span className="text-white font-bold">
                    {UPGRADE_PRICING.steeringKit[config.steeringKit] === 0
                      ? 'INCLUDED'
                      : `+$${UPGRADE_PRICING.steeringKit[config.steeringKit]}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Cockpit Seat: {config.seatKit.toUpperCase().replace(/_/g, ' ')}</span>
                  <span className="text-white font-bold">
                    {UPGRADE_PRICING.seatKit[config.seatKit] === 0
                      ? 'INCLUDED'
                      : `+$${UPGRADE_PRICING.seatKit[config.seatKit]}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Exhaust System: {config.exhaustMod.toUpperCase().replace(/_/g, ' ')}</span>
                  <span className="text-white font-bold">
                    {UPGRADE_PRICING.exhaustMod[config.exhaustMod] === 0
                      ? 'INCLUDED'
                      : `+$${UPGRADE_PRICING.exhaustMod[config.exhaustMod]}`}
                  </span>
                </div>

                {config.underglow !== 'none' && (
                  <div className="flex justify-between">
                    <span>Chassis Neon Underglow ({config.underglow.toUpperCase()})</span>
                    <span className="text-white font-bold">
                      +${UPGRADE_PRICING.underglow[config.underglow]}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-[#262838] pt-2 text-sm text-white font-bold">
                  <span>TOTAL BUILD ESTIMATE:</span>
                  <span className="text-red-500 font-mono text-base font-black">
                    ${metrics.totalPriceUsd.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Factory Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-zinc-400 mb-5">
              <div className="bg-[#14151E] p-2 rounded-lg border border-[#222432]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span>3-Year Frame Warranty</span>
              </div>
              <div className="bg-[#14151E] p-2 rounded-lg border border-[#222432]">
                <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span>14-21 Day Build Time</span>
              </div>
              <div className="bg-[#14151E] p-2 rounded-lg border border-[#222432]">
                <Truck className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span>Global Crated Freight</span>
              </div>
            </div>

            {/* Buyer Contact Form */}
            <form onSubmit={handleConfirmOrder} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                    Driver / Buyer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full bg-[#161722] border border-[#2A2B3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="marcus@motorsports.com"
                    className="w-full bg-[#161722] border border-[#2A2B3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Delivery Street Address & Country *
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Circuit Way 104, Austin TX, USA"
                  className="w-full bg-[#161722] border border-[#2A2B3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
                  Custom Laser-Engraved Chassis Plaque
                </label>
                <input
                  type="text"
                  value={customPlaque}
                  onChange={(e) => setCustomPlaque(e.target.value)}
                  className="w-full bg-[#161722] border border-[#2A2B3C] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Payment Terms Toggle */}
              <div className="pt-2">
                <span className="block text-xs font-mono text-zinc-400 uppercase mb-1.5">
                  Deposit / Payment Terms:
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('deposit')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      paymentOption === 'deposit'
                        ? 'bg-red-600/20 text-white border-red-500'
                        : 'bg-[#151620] text-zinc-400 border-[#262838]'
                    }`}
                  >
                    <div className="font-bold text-white">25% Production Deposit</div>
                    <div className="text-zinc-400 font-mono text-[11px]">
                      ${depositAmount.toLocaleString()} USD (Balance on crating)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption('full')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      paymentOption === 'full'
                        ? 'bg-red-600/20 text-white border-red-500'
                        : 'bg-[#151620] text-zinc-400 border-[#262838]'
                    }`}
                  >
                    <div className="font-bold text-white">Pay In Full (Priority Slot)</div>
                    <div className="text-zinc-400 font-mono text-[11px]">
                      ${metrics.totalPriceUsd.toLocaleString()} USD (Free crate freight)
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/80 border border-red-400 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Confirm & Reserve Build (${(paymentOption === 'deposit' ? depositAmount : metrics.totalPriceUsd).toLocaleString()} USD)</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
