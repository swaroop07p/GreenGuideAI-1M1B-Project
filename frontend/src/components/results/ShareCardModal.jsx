import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCo2Value } from '../../utils/calculations';

export default function ShareCardModal({
  isOpen,
  onClose,
  totalMonthlyKg,
  ecoScore,
  ecoTier,
  topTip
}) {
  const { unit } = useApp();
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw modern gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#064e3b'); // emerald-900
    bgGradient.addColorStop(0.5, '#042f2e'); // teal-950
    bgGradient.addColorStop(1, '#09090b'); // zinc-950
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric orbs
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.arc(1050, 120, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(20, 184, 166, 0.1)';
    ctx.beginPath();
    ctx.arc(150, 520, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Brand Header
    ctx.fillStyle = '#34d399'; // emerald-400
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('🌿 GreenGuide AI', 80, 90);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 22px sans-serif';
    ctx.fillText('UN SDG 13 Climate Action • Personal Footprint Advisor', 80, 130);

    // 3. Card Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.roundRect(80, 170, 1040, 360, 24);
    ctx.fill();
    ctx.stroke();

    // 4. Metric Column
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 20px sans-serif';
    ctx.fillText('ESTIMATED MONTHLY FOOTPRINT', 130, 230);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px monospace';
    const formatted = formatCo2Value(totalMonthlyKg, unit);
    ctx.fillText(formatted, 130, 310);

    // 5. Eco Score Badge on right
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.roundRect(760, 210, 310, 140, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 52px monospace';
    ctx.fillText(`${ecoScore}/100`, 800, 280);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(ecoTier, 800, 325);

    // 6. Top Action Tip
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'italic 22px sans-serif';
    const tipText = topTip || "Reducing solo car trips and shifting to plant-rich meals cuts footprint significantly.";
    ctx.fillText(`💡 Top Action: "${tipText.substring(0, 85)}..."`, 130, 420);

    // 7. Footer watermark
    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    ctx.fillText('100% Private & Anonymous • Generated at greenguide.ai', 80, 580);

  }, [isOpen, totalMonthlyKg, ecoScore, ecoTier, topTip, unit]);

  if (!isOpen) return null;

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `GreenGuide-Impact-${Math.round(totalMonthlyKg)}kg.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.clipboard) return;
    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      });
    } catch (e) {
      console.warn("Clipboard write error:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-800 p-4 sm:p-8 text-white shadow-2xl">
        
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold">Share Your Climate Impact Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mb-5">
          Purely client-side canvas render. Contains zero personal or location data.
        </p>

        {/* Canvas Preview Container */}
        <div className="w-full overflow-hidden rounded-2xl border border-zinc-800 shadow-inner bg-black/40 mb-6">
          <canvas
            ref={canvasRef}
            className="w-full h-auto aspect-[1200/630] block"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={copyImage}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied Image!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Image to Clipboard</span>
              </>
            )}
          </button>

          <button
            onClick={downloadImage}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG Card</span>
          </button>
        </div>

      </div>
    </div>
  );
}
