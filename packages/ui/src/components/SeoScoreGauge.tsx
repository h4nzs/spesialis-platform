import { cn } from '../utils/cn.ts';
import { getScoreColor, getScoreLabel } from '@specialist/shared';

export interface SeoScoreGaugeProps {
  score: number;
  size?: number;
  className?: string;
}

const STROKE_WIDTH = 6;
const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getColorVar(score: number): string {
  const color = getScoreColor(score);
  if (color === 'green') return 'var(--color-success-500, #22c55e)';
  if (color === 'yellow') return 'var(--color-warning-500, #f59e0b)';
  return 'var(--color-danger-500, #ef4444)';
}

function getBgColor(score: number): string {
  const color = getScoreColor(score);
  if (color === 'green') return 'var(--color-success-100, #dcfce7)';
  if (color === 'yellow') return 'var(--color-warning-100, #fef3c7)';
  return 'var(--color-danger-100, #fee2e2)';
}

export function SeoScoreGauge({ score, size = 100, className }: SeoScoreGaugeProps) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const color = getColorVar(score);
  const bgColor = getBgColor(score);

  return (
    <div
      className={cn('flex flex-col items-center gap-1', className)}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`SEO Score: ${score} dari 100 — ${getScoreLabel(score)}`}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          stroke={bgColor}
          strokeWidth={STROKE_WIDTH}
        />
        {/* Score arc */}
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{ transition: 'stroke-dashoffset 0.7s ease-out, stroke 0.3s ease' }}
        />
        {/* Score text */}
        <text
          x="40"
          y="40"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current text-2xl font-bold"
          transform="rotate(90, 40, 40)"
          style={{ fontSize: '20px', fontWeight: 700, fill: color }}
        >
          {score}
        </text>
      </svg>
      <span className="text-caption font-medium" style={{ color }}>
        {getScoreLabel(score)}
      </span>
    </div>
  );
}
