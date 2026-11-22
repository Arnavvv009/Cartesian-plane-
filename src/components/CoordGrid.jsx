import React, { useRef, useState } from 'react';

/* =========================================================================
   COORDINATE GRID — the Cartesian plane used everywhere in this module.
   • Static: points, segments, polygons, walk paths
   • Interactive: pass onPick(x, y) to snap clicks to whole-number points,
     with a hover crosshair that shows the coordinates under the cursor.
   ========================================================================= */
export const fmtN = n => (n < 0 ? `−${Math.abs(n)}` : `${n}`);
export const pt = (x, y) => `(${fmtN(x)}, ${fmtN(y)})`;

export function CoordGrid({
  min = -6, max = 6, S = 360, points = [], segments = [], polygon = null, walks = [],
  onPick = null, ghost = null, quadLabels = false, showLabels = true, className = ''
}) {
  const pad = 26;
  const N = max - min;
  const u = (S - 2 * pad) / N;
  const X = x => pad + (x - min) * u;
  const Y = y => pad + (max - y) * u;
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  const toGrid = e => {
    const r = ref.current.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * S;
    const sy = ((e.clientY - r.top) / r.height) * S;
    const gx = Math.round((sx - pad) / u + min);
    const gy = Math.round(max - (sy - pad) / u);
    if (gx < min || gx > max || gy < min || gy > max) return null;
    return [gx, gy];
  };

  const ticks = [];
  for (let i = min; i <= max; i++) ticks.push(i);
  const step = N > 14 ? 2 : 1;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${S} ${S}`}
      className={`w-full h-full ${onPick ? 'cursor-crosshair' : ''} ${className}`}
      onMouseMove={onPick ? e => setHover(toGrid(e)) : undefined}
      onMouseLeave={onPick ? () => setHover(null) : undefined}
      onClick={onPick ? e => { const g = toGrid(e); if (g) onPick(g[0], g[1]); } : undefined}
    >
      <rect x={pad} y={pad} width={N * u} height={N * u} fill="#0b1a3a" rx="6" />
      {quadLabels && (
        <g fontSize={S / 9} fontWeight="900" fill="#ffffff" opacity="0.07" textAnchor="middle" dominantBaseline="middle">
          <text x={X(max / 2)} y={Y(max / 2)}>I</text>
          <text x={X(min / 2)} y={Y(max / 2)}>II</text>
          <text x={X(min / 2)} y={Y(min / 2)}>III</text>
          <text x={X(max / 2)} y={Y(min / 2)}>IV</text>
        </g>
      )}
      {ticks.map(i => (
        <g key={i}>
          <line x1={X(i)} y1={Y(min)} x2={X(i)} y2={Y(max)} stroke="rgba(125,211,252,0.16)" strokeWidth="1" />
          <line x1={X(min)} y1={Y(i)} x2={X(max)} y2={Y(i)} stroke="rgba(125,211,252,0.16)" strokeWidth="1" />
        </g>
      ))}
      {/* axes */}
      <line x1={X(min)} y1={Y(0)} x2={X(max) + 10} y2={Y(0)} stroke="#e2e8f0" strokeWidth="2.2" />
      <line x1={X(0)} y1={Y(min)} x2={X(0)} y2={Y(max) - 10} stroke="#e2e8f0" strokeWidth="2.2" />
      <polygon points={`${X(max) + 16},${Y(0)} ${X(max) + 7},${Y(0) - 5} ${X(max) + 7},${Y(0) + 5}`} fill="#e2e8f0" />
      <polygon points={`${X(0)},${Y(max) - 16} ${X(0) - 5},${Y(max) - 7} ${X(0) + 5},${Y(max) - 7}`} fill="#e2e8f0" />
      <text x={X(max) + 14} y={Y(0) - 10} fill="#facc15" fontSize="13" fontWeight="900" textAnchor="middle">x</text>
      <text x={X(0) + 12} y={Y(max) - 12} fill="#facc15" fontSize="13" fontWeight="900">y</text>
      {ticks.filter(i => i !== 0 && i % step === 0).map(i => (
        <g key={`t${i}`} fontSize="9.5" fontWeight="800" fill="#94a3b8">
          <text x={X(i)} y={Y(0) + 12} textAnchor="middle">{fmtN(i)}</text>
          <text x={X(0) - 5} y={Y(i) + 3} textAnchor="end">{fmtN(i)}</text>
        </g>
      ))}
      <text x={X(0) - 5} y={Y(0) + 12} fontSize="9.5" fontWeight="900" fill="#cbd5e1" textAnchor="end">O</text>

      {polygon && (
        <polygon points={polygon.pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}
          fill={polygon.color || '#facc15'} fillOpacity="0.22" stroke={polygon.color || '#facc15'} strokeWidth="2.5" strokeLinejoin="round"
          strokeDasharray={polygon.dashed ? '7 5' : 'none'} />
      )}

      {walks.map((w, i) => {
        const [x, y] = w.to;
        const [x0, y0] = w.from || [0, 0];
        return (
          <g key={`w${i}`}>
            <path d={`M${X(x0)} ${Y(y0)} H${X(x)} V${Y(y)}`} fill="none" stroke={w.color || '#4ade80'} strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" />
          </g>
        );
      })}

      {segments.map((s, i) => (
        <g key={`s${i}`}>
          <line x1={X(s.a[0])} y1={Y(s.a[1])} x2={X(s.b[0])} y2={Y(s.b[1])} stroke={s.color || '#f472b6'} strokeWidth="3" strokeLinecap="round" strokeDasharray={s.dashed ? '7 5' : 'none'} />
          {s.label && (
            <text x={(X(s.a[0]) + X(s.b[0])) / 2 + (s.dx || 0)} y={(Y(s.a[1]) + Y(s.b[1])) / 2 + (s.dy ?? -8)} fill={s.color || '#f472b6'} fontSize="12" fontWeight="900" textAnchor="middle"
              style={{ paintOrder: 'stroke', stroke: '#0b1a3a', strokeWidth: 4 }}>{s.label}</text>
          )}
        </g>
      ))}

      {ghost && (
        <g>
          <circle cx={X(ghost[0])} cy={Y(ghost[1])} r="8" fill="none" stroke="#f87171" strokeWidth="3" />
          <line x1={X(ghost[0]) - 5} y1={Y(ghost[1]) - 5} x2={X(ghost[0]) + 5} y2={Y(ghost[1]) + 5} stroke="#f87171" strokeWidth="3" />
          <line x1={X(ghost[0]) + 5} y1={Y(ghost[1]) - 5} x2={X(ghost[0]) - 5} y2={Y(ghost[1]) + 5} stroke="#f87171" strokeWidth="3" />
        </g>
      )}

      {points.map((p, i) => {
        const right = p.x < max - 2;
        const above = p.y < max - 1;
        return (
          <g key={`p${i}`}>
            <circle cx={X(p.x)} cy={Y(p.y)} r={p.r || 6.5} fill={p.color || '#facc15'} stroke="#0c0424" strokeWidth="2" />
            {showLabels && p.label && (
              <text x={X(p.x) + (right ? 9 : -9)} y={Y(p.y) + (above ? -9 : 16)} fill={p.color || '#facc15'} fontSize="12.5" fontWeight="900"
                textAnchor={right ? 'start' : 'end'} style={{ paintOrder: 'stroke', stroke: '#0b1a3a', strokeWidth: 4 }}>
                {p.label}
              </text>
            )}
          </g>
        );
      })}

      {onPick && hover && (
        <g pointerEvents="none">
          <line x1={X(hover[0])} y1={Y(min)} x2={X(hover[0])} y2={Y(max)} stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1.5" />
          <line x1={X(min)} y1={Y(hover[1])} x2={X(max)} y2={Y(hover[1])} stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1.5" />
          <circle cx={X(hover[0])} cy={Y(hover[1])} r="6" fill="#38bdf8" fillOpacity="0.5" />
          <rect x={Math.min(X(hover[0]) + 8, S - 70)} y={Math.max(Y(hover[1]) - 28, 2)} width="62" height="20" rx="6" fill="#0c0424" stroke="#38bdf8" />
          <text x={Math.min(X(hover[0]) + 8, S - 70) + 31} y={Math.max(Y(hover[1]) - 28, 2) + 14} fill="#7dd3fc" fontSize="11.5" fontWeight="900" textAnchor="middle">
            {pt(hover[0], hover[1])}
          </text>
        </g>
      )}
    </svg>
  );
}

/** Practice-question diagram: a square grid centred in the card. */
export function CoordDiagram({ diagramData, size = 200 }) {
  if (!diagramData) return null;
  return (
    <div className="flex items-center justify-center my-1">
      <div style={{ width: size, height: size }}>
        <CoordGrid S={300} quadLabels={!!diagramData.quadLabels} {...diagramData} />
      </div>
    </div>
  );
}
