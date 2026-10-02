'use client';

import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  registerables,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { type SarTimeSeriesPoint } from '@/lib/sarAnalysis';

// Register all Chart.js components including LineController, scales, and elements
ChartJS.register(...registerables);

interface SarTimeSeriesGraphProps {
  points: SarTimeSeriesPoint[];
  baselineVV?: number;
  baselineVH?: number;
  className?: string;
  height?: number;
}

export function SarTimeSeriesGraph({
  points,
  baselineVV = -11.5,
  baselineVH = -17.8,
  className = '',
  height = 240,
}: SarTimeSeriesGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;

    // Destroy existing instance to prevent memory leaks or duplicate canvas renders
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create subtle gradient fills for cyber glow
    const gradientVV = ctx.createLinearGradient(0, 0, 0, height);
    gradientVV.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gradientVV.addColorStop(1, 'rgba(56, 189, 248, 0.01)');

    const gradientVH = ctx.createLinearGradient(0, 0, 0, height);
    gradientVH.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
    gradientVH.addColorStop(1, 'rgba(52, 211, 153, 0.01)');

    const labels = points.map((p) => p.date);
    const vvData = points.map((p) => p.vvDb);
    const vhData = points.map((p) => p.vhDb);

    const chartData: ChartData<'line'> = {
      labels,
      datasets: [
        {
          label: 'σ° VV (Co-Pol)',
          data: vvData,
          borderColor: '#38bdf8', // Neon Sky Blue
          backgroundColor: gradientVV,
          borderWidth: 2.2,
          pointBackgroundColor: points.map((p) => (p.isAnomaly ? '#f43f5e' : '#38bdf8')),
          pointBorderColor: '#050914',
          pointBorderWidth: 2,
          pointRadius: points.map((p) => (p.isAnomaly ? 5 : 3.5)),
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#38bdf8',
          tension: 0.3,
          fill: true,
        },
        {
          label: 'σ° VH (Cross-Pol)',
          data: vhData,
          borderColor: '#34d399', // Emerald Green
          backgroundColor: gradientVH,
          borderWidth: 2.0,
          pointBackgroundColor: points.map((p) => (p.isAnomaly ? '#fbbf24' : '#34d399')),
          pointBorderColor: '#050914',
          pointBorderWidth: 2,
          pointRadius: points.map((p) => (p.isAnomaly ? 4.5 : 3.0)),
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#34d399',
          tension: 0.3,
          fill: true,
        },
      ],
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: 'circle',
            color: '#94a3b8',
            font: {
              family: 'monospace',
              size: 10,
              weight: 'bold',
            },
            padding: 12,
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(5, 9, 20, 0.92)',
          titleColor: '#f8fafc',
          titleFont: {
            family: 'monospace',
            size: 11,
            weight: 'bold',
          },
          bodyColor: '#cbd5e1',
          bodyFont: {
            family: 'monospace',
            size: 10,
          },
          borderColor: 'rgba(56, 189, 248, 0.35)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          displayColors: true,
          boxPadding: 4,
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const index = items[0].dataIndex;
              const point = points[index];
              return `Acquisition: ${point.date} (${point.orbit})`;
            },
            label: (item) => {
              const val = item.parsed.y;
              if (val == null) return ` ${item.dataset.label}: N/A`;
              return ` ${item.dataset.label}: ${val > 0 ? '+' : ''}${val.toFixed(2)} dB`;
            },
            afterBody: (items) => {
              if (!items.length) return [];
              const index = items[0].dataIndex;
              const point = points[index];
              const ratio = point.ratioDb;
              const lines = [
                `Ratio (VV - VH): ${ratio.toFixed(2)} dB`,
                `Platform: ${point.platform} (Pass #${point.passNumber})`,
              ];
              if (point.isAnomaly) {
                lines.push(`⚠ Anomaly Delta: ${point.deltaFromBaselineDb > 0 ? '+' : ''}${point.deltaFromBaselineDb.toFixed(2)} dB`);
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(56, 189, 248, 0.08)',
          },
          ticks: {
            color: '#64748b',
            font: {
              family: 'monospace',
              size: 9,
            },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
          },
          border: {
            color: 'rgba(56, 189, 248, 0.2)',
          },
        },
        y: {
          grid: {
            color: 'rgba(56, 189, 248, 0.08)',
          },
          ticks: {
            color: '#64748b',
            font: {
              family: 'monospace',
              size: 9,
            },
            callback: (val) => `${val} dB`,
          },
          border: {
            color: 'rgba(56, 189, 248, 0.2)',
          },
          title: {
            display: true,
            text: 'Backscatter σ° (dB)',
            color: '#94a3b8',
            font: {
              family: 'monospace',
              size: 9,
            },
          },
        },
      },
      animation: {
        duration: 600,
        easing: 'easeOutQuart',
      },
    };

    const newChart = new ChartJS(ctx, {
      type: 'line',
      data: chartData,
      options,
    });

    chartInstanceRef.current = newChart;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [points, baselineVV, baselineVH, height]);

  return (
    <div className={`relative w-full ${className}`} style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
