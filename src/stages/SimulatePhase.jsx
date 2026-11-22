import React, { useState, useEffect, useRef } from 'react';
import { BgSymbols } from '../components/TopNav.jsx';
import { narrate, stopNarration } from '../utils/audio.js';
import { simulateStationIntro, simulateActivityNarration, simulateHintNarration, feedbackNarration } from '../utils/narration.js';
import { CoordGrid, pt, fmtN } from '../components/CoordGrid.jsx';

/* =========================================================================
   SIMULATION STATIONS — The Cartesian Plane (Grade 8)
   Station 1 · Map Plotter         → SEE how (x, y) locates a point + quadrants
   Station 2 · Shape Detective     → TRY it: plot a missing vertex, find area
   Station 3 · Treasure Navigator  → APPLY: translations, distances, reflections
   ========================================================================= */

const close = (a, b) => Math.abs(a - b) < 0.0011;
const quadOf = (x, y) => (x === 0 || y === 0 ? 'Axis' : x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III'));
const QUADS = ['I', 'II', 'III', 'IV', 'Axis'];
const COLORS = ['#facc15', '#f472b6', '#38bdf8', '#4ade80'];

/* ------------------------------------------------------------------------
   STATION DATA
   ------------------------------------------------------------------------ */
const STATION_ACTIVITIES = {
  1: [
    {
      id: 1,
      title: "Activity 1: Treasure Island",
      desc: "Plot the four landmarks on Captain Ava's island map. Click the grid where each point belongs, then name the quadrant of every landmark.",
      icon: "🏝️",
      targets: [
        { name: 'Lighthouse', x: 3, y: 2 },
        { name: 'Palm Tree', x: -4, y: 3 },
        { name: 'Cave', x: -2, y: -5 },
        { name: 'Dock', x: 5, y: -1 }
      ],
      hint: "Start at the origin. Move along the x-axis first (right if positive, left if negative), then up or down for y."
    },
    {
      id: 2,
      title: "Activity 2: City Map",
      desc: "Plot these places on the city map. Watch out — some of them sit right on an axis! Then name the quadrant of each one.",
      icon: "🏙️",
      targets: [
        { name: 'Library', x: 0, y: 3 },
        { name: 'Mall', x: -5, y: 0 },
        { name: 'Station', x: 2, y: -4 },
        { name: 'Zoo', x: -1, y: -2 }
      ],
      hint: "A 0 means 'don't move' in that direction. (0, 3) sits on the y-axis; (−5, 0) sits on the x-axis."
    },
    {
      id: 3,
      title: "Activity 3: Star Map",
      desc: "An astronomer marks four stars. Plot each star, including the one at the origin, then name every star's quadrant.",
      icon: "🔭",
      targets: [
        { name: 'Sirius', x: 6, y: -3 },
        { name: 'Vega', x: -6, y: 5 },
        { name: 'Polaris', x: 0, y: 0 },
        { name: 'Rigel', x: -3, y: -6 }
      ],
      hint: "The origin (0, 0) is where the axes cross. Points on an axis are not in any quadrant."
    }
  ],
  2: [
    {
      id: 1,
      title: "Activity 1: The Missing Corner",
      desc: "A rectangular park has corners at A(−4, 3), B(2, 3) and C(2, −1). Plot the fourth corner D, then find the park's length, width and area.",
      icon: "🌳",
      given: [{ label: 'A', x: -4, y: 3 }, { label: 'B', x: 2, y: 3 }, { label: 'C', x: 2, y: -1 }],
      missing: { label: 'D', x: -4, y: -1 },
      order: ['A', 'B', 'C', 'D'],
      groups: [
        { label: 'Length AB', formula: '2 − (−4) =', answer: 6, unit: 'units' },
        { label: 'Width BC', formula: '3 − (−1) =', answer: 4, unit: 'units' },
        { label: 'Area', formula: '6 × 4 =', answer: 24, unit: 'sq units' }
      ],
      hint: "D lines up under A (same x as A) and across from C (same y as C)."
    },
    {
      id: 2,
      title: "Activity 2: Square Swimming Pool",
      desc: "A square pool has corners at P(−1, 4), Q(3, 4) and R(3, 0). Plot the fourth corner S, then find the side length, perimeter and area.",
      icon: "🏊",
      given: [{ label: 'P', x: -1, y: 4 }, { label: 'Q', x: 3, y: 4 }, { label: 'R', x: 3, y: 0 }],
      missing: { label: 'S', x: -1, y: 0 },
      order: ['P', 'Q', 'R', 'S'],
      groups: [
        { label: 'Side PQ', formula: '3 − (−1) =', answer: 4, unit: 'units' },
        { label: 'Perimeter', formula: '4 × 4 =', answer: 16, unit: 'units' },
        { label: 'Area', formula: '4 × 4 =', answer: 16, unit: 'sq units' }
      ],
      hint: "S has the same x as P and the same y as R. It sits on the x-axis!"
    },
    {
      id: 3,
      title: "Activity 3: Triangular Sail",
      desc: "A sail is a right triangle with base J(−3, −2) to K(3, −2). The top corner L is directly above J and 6 units up. Plot L, then find the base, height and area.",
      icon: "⛵",
      given: [{ label: 'J', x: -3, y: -2 }, { label: 'K', x: 3, y: -2 }],
      missing: { label: 'L', x: -3, y: 4 },
      order: ['J', 'K', 'L'],
      groups: [
        { label: 'Base JK', formula: '3 − (−3) =', answer: 6, unit: 'units' },
        { label: 'Height JL', formula: '4 − (−2) =', answer: 6, unit: 'units' },
        { label: 'Area', formula: '½ × 6 × 6 =', answer: 18, unit: 'sq units' }
      ],
      hint: "Directly above J means the same x-coordinate (−3). Count 6 up from y = −2."
    }
  ],
  3: [
    {
      id: 1,
      title: "Activity 1: Follow the Clues",
      desc: "Ava starts at (−4, −2). Clue 1: walk 6 units right. Clue 2: walk 5 units up. Where is the treasure, and how far did she walk?",
      icon: "🗝️",
      steps: [
        { text: "After 6 right, new x = −4 + 6 =", answer: 2, unit: "" },
        { text: "After 5 up, new y = −2 + 5 =", answer: 3, unit: "" },
        { text: "Total distance walked = 6 + 5 =", answer: 11, unit: "units" }
      ],
      scene: k => ({
        points: [
          { x: -4, y: -2, label: 'Start (−4, −2)', color: '#4ade80' },
          ...(k >= 1 ? [{ x: 2, y: -2, label: k >= 2 ? '' : '(2, −2)', color: '#38bdf8', r: 5 }] : []),
          ...(k >= 2 ? [{ x: 2, y: 3, label: '💰 (2, 3)', color: '#facc15' }] : [])
        ],
        segments: [
          ...(k >= 1 ? [{ a: [-4, -2], b: [2, -2], color: '#38bdf8', label: '6 right', dy: 16 }] : []),
          ...(k >= 2 ? [{ a: [2, -2], b: [2, 3], color: '#f472b6', label: '5 up', dx: 24, dy: 0 }] : [])
        ]
      }),
      hint: "Moving right adds to x. Moving up adds to y."
    },
    {
      id: 2,
      title: "Activity 2: Rescue Mission",
      desc: "A boat at (−5, 3) sails straight to a lighthouse at (4, 3). A helicopter then flies from the lighthouse straight down to (4, −3). How long is each leg of the trip?",
      icon: "🚁",
      steps: [
        { text: "Same y, so boat → lighthouse = 4 − (−5) =", answer: 9, unit: "units" },
        { text: "Same x, so lighthouse → helicopter = 3 − (−3) =", answer: 6, unit: "units" },
        { text: "Total trip = 9 + 6 =", answer: 15, unit: "units" }
      ],
      scene: k => ({
        points: [
          { x: -5, y: 3, label: 'Boat', color: '#38bdf8' },
          { x: 4, y: 3, label: 'Lighthouse', color: '#facc15' },
          { x: 4, y: -3, label: 'Helicopter', color: '#f472b6' }
        ],
        segments: [
          { a: [-5, 3], b: [4, 3], color: '#38bdf8', dashed: k < 1, label: k >= 1 ? '9 units' : '?' },
          { a: [4, 3], b: [4, -3], color: '#f472b6', dashed: k < 2, label: k >= 2 ? '6 units' : '?', dx: -30, dy: 0 }
        ]
      }),
      hint: "On a horizontal line, subtract the x-coordinates. On a vertical line, subtract the y-coordinates."
    },
    {
      id: 3,
      title: "Activity 3: Mirror Lake",
      desc: "A swan is at M(3, −2). The x-axis is the edge of a mirror-still lake. Find the swan's reflection in the x-axis, then its reflection in the y-axis.",
      icon: "🦢",
      steps: [
        { text: "Reflect in x-axis: x stays 3, y becomes", answer: 2, unit: "" },
        { text: "Reflect M in y-axis: y stays −2, x becomes", answer: -3, unit: "" },
        { text: "Distance from M to its x-axis reflection =", answer: 4, unit: "units" }
      ],
      scene: k => ({
        points: [
          { x: 3, y: -2, label: 'M (3, −2)', color: '#facc15' },
          ...(k >= 1 ? [{ x: 3, y: 2, label: "M' (3, 2)", color: '#38bdf8' }] : []),
          ...(k >= 2 ? [{ x: -3, y: -2, label: "M'' (−3, −2)", color: '#f472b6' }] : [])
        ],
        segments: [
          ...(k >= 1 ? [{ a: [3, -2], b: [3, 2], color: '#38bdf8', dashed: true, label: k >= 3 ? '4 units' : '', dx: 28, dy: 0 }] : []),
          ...(k >= 2 ? [{ a: [3, -2], b: [-3, -2], color: '#f472b6', dashed: true }] : [])
        ]
      }),
      hint: "Reflecting in the x-axis changes the sign of y. Reflecting in the y-axis changes the sign of x."
    }
  ]
};

/* ------------------------------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------------------------------ */
export function SimulatePhase({ muted, onNext }) {
  const [station, setStation] = useState(1);
  const [actIdx, setActIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Station 1
  const [plotted, setPlotted] = useState(0);
  const [ghost, setGhost] = useState(null);
  const [quadPick, setQuadPick] = useState({});
  const [quadOk, setQuadOk] = useState({});

  // Station 2
  const [vertexOk, setVertexOk] = useState(false);
  const [groupAns, setGroupAns] = useState({});
  const [groupOk, setGroupOk] = useState({});

  // Station 3
  const [stepIdx, setStepIdx] = useState(0);
  const [stepAns, setStepAns] = useState('');
  const [stepWrong, setStepWrong] = useState(false);

  const currentActivity = STATION_ACTIVITIES[station][actIdx];
  const say = list => narrate(list, !muted);

  useEffect(() => {
    setShowHint(false);
    setFeedback(null);
    setPlotted(0);
    setGhost(null);
    setQuadPick({});
    setQuadOk({});
    setVertexOk(false);
    setGroupAns({});
    setGroupOk({});
    setStepIdx(0);
    setStepAns('');
    setStepWrong(false);
  }, [station, actIdx]);

  // Narrate the station intro (only when the station changes) followed by the
  // current activity's description. Doing this in ONE effect (instead of two
  // separate ones) prevents the activity narration from cutting off the station
  // intro — both lines now play in sequence and are audible.
  const prevStationRef = useRef(null);
  useEffect(() => {
    const stationChanged = prevStationRef.current !== station;
    prevStationRef.current = station;
    const intro = stationChanged ? simulateStationIntro(station) : [];
    const desc = simulateActivityNarration(station, actIdx);
    narrate([...intro, ...desc], !muted);
    return () => stopNarration();
  }, [station, actIdx, muted]);

  /* ---------- Station 1 ---------- */
  const targets = station === 1 ? currentActivity.targets : [];
  const allPlotted = station === 1 && plotted >= targets.length;
  const pickS1 = (x, y) => {
    if (allPlotted) return;
    const t = targets[plotted];
    if (x === t.x && y === t.y) {
      setPlotted(n => n + 1);
      setGhost(null);
      setFeedback({ success: true, text: `✅ ${t.name} plotted at ${pt(x, y)}!` });
    } else {
      setGhost([x, y]);
      const swapped = x === t.y && y === t.x;
      setFeedback({
        success: false,
        text: swapped
          ? `You clicked ${pt(x, y)} — the numbers are swapped! x (left/right) comes first.`
          : `You clicked ${pt(x, y)}. ${t.name} is at ${pt(t.x, t.y)} — count again from the origin.`
      });
      say(feedbackNarration.tryAgain());
    }
  };
  const checkQuads = () => {
    const ok = {};
    targets.forEach((t, i) => { ok[i] = quadPick[i] === quadOf(t.x, t.y); });
    setQuadOk(ok);
    if (Object.values(ok).every(Boolean)) {
      setFeedback({ success: true, text: `🎉 All points plotted and every quadrant named correctly!` });
      say(feedbackNarration.splitDone());
    } else {
      setFeedback({ success: false, text: "Some quadrants are wrong (red). Check the signs of x and y!" });
      say(feedbackNarration.tryAgain());
    }
  };

  /* ---------- Station 2 ---------- */
  const pickS2 = (x, y) => {
    if (vertexOk) return;
    const m = currentActivity.missing;
    if (x === m.x && y === m.y) {
      setVertexOk(true);
      setGhost(null);
      setFeedback({ success: true, text: `✅ ${m.label} is at ${pt(x, y)}! Now measure the shape.` });
    } else {
      setGhost([x, y]);
      setFeedback({ success: false, text: `${pt(x, y)} doesn't complete the shape. Line it up with the other corners.` });
      say(feedbackNarration.tryAgain());
    }
  };
  const checkShape = () => {
    const ok = {};
    currentActivity.groups.forEach((g, i) => { ok[i] = close(parseFloat(groupAns[i]), g.answer); });
    setGroupOk(ok);
    if (Object.values(ok).every(Boolean)) {
      setFeedback({ success: true, text: `🎉 Area = ${currentActivity.groups[currentActivity.groups.length - 1].answer} square units. Case solved!` });
      say(feedbackNarration.buildDone());
    } else {
      setFeedback({ success: false, text: "Some boxes are red — count the units between the coordinates again!" });
      say(feedbackNarration.tryAgain());
    }
  };

  /* ---------- Station 3 ---------- */
  const checkStep = () => {
    const st = currentActivity.steps[stepIdx];
    if (close(parseFloat(stepAns), st.answer)) {
      const next = stepIdx + 1;
      setStepIdx(next);
      setStepAns('');
      setStepWrong(false);
      if (next >= currentActivity.steps.length) {
        setFeedback({ success: true, text: `🎉 Navigation complete!` });
        say(feedbackNarration.reverseDone());
      } else {
        setFeedback(null);
      }
    } else {
      setStepWrong(true);
      setFeedback({ success: false, text: "Not quite — check this step. Use the 💡 Hint if you're stuck!" });
      say(feedbackNarration.tryAgain());
    }
  };

  /* ---------- Navigation ---------- */
  const nextActivity = () => {
    if (actIdx < 2) {
      setActIdx(i => i + 1);
    } else if (station < 3) {
      setStation(s => s + 1);
      setActIdx(0);
    } else {
      onNext();
    }
  };

  const prevActivity = () => {
    if (actIdx > 0) {
      setActIdx(i => i - 1);
    } else if (station > 1) {
      setStation(s => s - 1);
      setActIdx(2);
    }
  };

  const STATIONS = [
    { n: 1, icon: '📍', name: 'Station 1: Map Plotter', sub: 'Plot points & name quadrants' },
    { n: 2, icon: '🔍', name: 'Station 2: Shape Detective', sub: 'Find the hidden corner' },
    { n: 3, icon: '🧭', name: 'Station 3: Treasure Navigator', sub: 'Moves, distances & mirrors' }
  ];

  const inputCls = ok =>
    `bg-[#14082c] border-2 rounded-xl px-3 py-2 text-white font-display font-900 text-base text-center outline-none w-24 shadow-inner ${
      ok === true ? 'border-emerald-400' : ok === false ? 'border-rose-400' : 'border-cyan-400/70 focus:border-amber-400'
    }`;

  const hintBtn = (
    <button
      onClick={() => {
        setShowHint(h => !h);
        if (!showHint) say(simulateHintNarration(station, actIdx));
      }}
      className="bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-purple-200 font-display font-900 text-xs px-3 py-2 rounded-xl transition cursor-pointer"
    >
      💡 Hint
    </button>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none z-10">
      <BgSymbols />

      {/* Main Simulation Stations Glass Card Container */}
      <div className="w-full max-w-6xl max-h-[94vh] bg-[#160b36]/95 border-2 border-purple-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md flex flex-col items-center fade-in-up z-20 my-auto overflow-hidden">
        {/* Cyan Accent Bar */}
        <div className="w-24 h-2 bg-cyan-400 rounded-full mb-2.5 shadow-[0_0_18px_rgba(56,189,248,0.85)] shrink-0" />

        {/* Card Header Title */}
        <h2 className="font-display font-900 text-2xl sm:text-3xl text-white flex items-center gap-3 mb-3.5 shrink-0">
          <span className="text-3xl sm:text-4xl">🧪</span>
          <span>Simulation Stations</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 w-full items-stretch flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Station Sidebar Tabs */}
          <div className="md:col-span-4 flex flex-col justify-between gap-3 shrink-0">
            <div className="flex flex-col gap-3.5">
              {STATIONS.map(s => (
                <button
                  key={s.n}
                  onClick={() => {
                    setStation(s.n);
                    setActIdx(0);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between text-left transition-all duration-200 cursor-pointer ${
                    station === s.n
                      ? 'border-cyan-400 bg-[#1e2852] text-white shadow-[0_0_22px_rgba(56,189,248,0.4)] scale-[1.02]'
                      : 'border-purple-500/25 bg-[#13082b]/80 text-slate-300 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${
                      station === s.n ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/10 text-white'
                    }`}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="font-display font-900 text-base sm:text-lg leading-tight">{s.name}</p>
                      <p className="text-xs font-extrabold text-slate-300 mt-0.5">{s.sub}</p>
                    </div>
                  </div>
                  <span className="text-base">🔓</span>
                </button>
              ))}
            </div>

            {/* Bottom Left CTA Button */}
            <button
              onClick={onNext}
              className="btn-gold font-display font-900 text-base sm:text-lg py-4 px-6 shadow-[0_0_25px_rgba(250,204,21,0.65)] hover:scale-105 transition mt-2 w-full flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Go to Practice Phase!</span>
              <span>→</span>
            </button>
          </div>

          {/* Right Column: Interactive Simulation Box */}
          <div className="md:col-span-8 bg-[#13092e]/95 border-2 border-purple-400/35 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-inner flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0 justify-between">
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3 shrink-0 gap-3">
                <h3 className="font-display font-900 text-xl sm:text-2xl text-cyan-300 flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">{currentActivity.icon}</span>
                  <span>{currentActivity.title}</span>
                </h3>
                <span className="font-display font-900 text-xs sm:text-sm text-slate-200 bg-white/10 px-4 py-1 rounded-full border border-white/15 shrink-0">
                  Activity {actIdx + 1} of 3
                </span>
              </div>

              {/* Activity Description */}
              <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-extrabold mb-3 shrink-0">
                {currentActivity.desc}
              </p>

              {/* ===================== STATION 1: MAP PLOTTER ===================== */}
              {station === 1 && (
                <div className="flex gap-4 bg-[#1e1342]/95 border-2 border-cyan-400/40 rounded-2xl p-3 sm:p-4 shadow-xl flex-1 min-h-0">
                  <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center">
                    <div className="h-full aspect-square max-w-full">
                      <CoordGrid
                        quadLabels
                        onPick={allPlotted ? null : pickS1}
                        ghost={ghost}
                        walks={targets.slice(0, plotted).slice(-1).map((t, i) => ({ to: [t.x, t.y], color: COLORS[(plotted - 1) % 4] }))}
                        points={targets.slice(0, plotted).map((t, i) => ({ x: t.x, y: t.y, label: t.name, color: COLORS[i] }))}
                      />
                    </div>
                  </div>

                  <div className="w-60 sm:w-64 shrink-0 flex flex-col gap-2 min-h-0 overflow-y-auto">
                    {!allPlotted ? (
                      <>
                        <p className="text-xs font-900 text-cyan-300 uppercase tracking-wider">① Click to plot ({plotted}/{targets.length})</p>
                        {targets.map((t, i) => (
                          <div
                            key={i}
                            className={`rounded-xl px-3 py-2 border-2 flex justify-between items-center text-sm font-900 ${
                              i < plotted ? 'bg-emerald-950/60 border-emerald-400/60 text-emerald-300' : i === plotted ? 'bg-[#14082c] border-amber-400 text-white' : 'bg-[#14082c]/50 border-white/10 text-slate-500'
                            }`}
                          >
                            <span>{i < plotted ? '✔ ' : i === plotted ? '▶ ' : ''}{t.name}</span>
                            <span style={{ color: i <= plotted ? COLORS[i] : undefined }}>{pt(t.x, t.y)}</span>
                          </div>
                        ))}
                        <p className="text-xs font-bold text-slate-400 italic">Hover over the grid to see the coordinates under your pointer.</p>
                        <div className="flex">{hintBtn}</div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-900 text-cyan-300 uppercase tracking-wider">② Name each quadrant</p>
                        {targets.map((t, i) => (
                          <div key={i} className={`rounded-xl p-2 border-2 ${quadOk[i] === true ? 'border-emerald-400/70' : quadOk[i] === false ? 'border-rose-400/70' : 'border-white/15'} bg-[#14082c]`}>
                            <p className="text-xs font-900" style={{ color: COLORS[i] }}>{t.name} {pt(t.x, t.y)}</p>
                            <div className="flex gap-1 mt-1">
                              {QUADS.map(q => (
                                <button
                                  key={q}
                                  onClick={() => { setQuadPick(s => ({ ...s, [i]: q })); setQuadOk(s => ({ ...s, [i]: undefined })); }}
                                  className={`flex-1 py-1 rounded-md text-[11px] font-900 border transition cursor-pointer ${
                                    quadPick[i] === q ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-white/5 text-white border-white/15 hover:border-cyan-400'
                                  }`}
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button onClick={checkQuads} className="btn-gold flex-1 text-sm font-900 px-3 py-2.5">Check ✨</button>
                          {hintBtn}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ===================== STATION 2: SHAPE DETECTIVE ===================== */}
              {station === 2 && (() => {
                const a = currentActivity;
                const all = vertexOk ? [...a.given, a.missing] : a.given;
                const byLabel = Object.fromEntries(all.map(p => [p.label, [p.x, p.y]]));
                const ordered = a.order.filter(l => byLabel[l]).map(l => byLabel[l]);
                return (
                  <div className="flex gap-4 bg-[#1e1342]/95 border-2 border-cyan-400/40 rounded-2xl p-3 sm:p-4 shadow-xl flex-1 min-h-0">
                    <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center">
                      <div className="h-full aspect-square max-w-full">
                        <CoordGrid
                          onPick={vertexOk ? null : pickS2}
                          ghost={ghost}
                          polygon={{ pts: ordered, color: vertexOk ? '#4ade80' : '#facc15', dashed: !vertexOk }}
                          points={all.map((p, i) => ({ x: p.x, y: p.y, label: `${p.label}${pt(p.x, p.y)}`, color: p === a.missing ? '#4ade80' : COLORS[i] }))}
                        />
                      </div>
                    </div>

                    <div className="w-64 sm:w-72 shrink-0 flex flex-col gap-2.5 min-h-0 overflow-y-auto">
                      {!vertexOk ? (
                        <>
                          <p className="text-xs font-900 text-cyan-300 uppercase tracking-wider">① Plot the missing corner {a.missing.label}</p>
                          {a.given.map((p, i) => (
                            <div key={i} className="rounded-xl px-3 py-2 border-2 border-white/15 bg-[#14082c] flex justify-between text-sm font-900">
                              <span style={{ color: COLORS[i] }}>{p.label}</span>
                              <span className="text-white">{pt(p.x, p.y)}</span>
                            </div>
                          ))}
                          <div className="rounded-xl px-3 py-2 border-2 border-dashed border-emerald-400/60 bg-[#14082c] flex justify-between text-sm font-900">
                            <span className="text-emerald-300">{a.missing.label}</span>
                            <span className="text-slate-400">( ?, ? )</span>
                          </div>
                          <p className="text-xs font-bold text-slate-400 italic">Click the grid where the hidden corner must be.</p>
                          <div className="flex">{hintBtn}</div>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-900 text-cyan-300 uppercase tracking-wider">② Measure the shape</p>
                          {a.groups.map((g, i) => (
                            <div key={i} className="bg-[#14082c] rounded-xl p-2.5 border-2 border-amber-400/40">
                              <p className="text-xs font-900 text-amber-300">{g.label}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-900 text-slate-200 flex-1">{g.formula}</span>
                                <input type="number" value={groupAns[i] || ''} onChange={e => setGroupAns(s => ({ ...s, [i]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && checkShape()} className={inputCls(groupOk[i])} />
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <button onClick={checkShape} className="btn-gold flex-1 text-sm font-900 px-3 py-2.5">Check ✨</button>
                            {hintBtn}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ===================== STATION 3: TREASURE NAVIGATOR ===================== */}
              {station === 3 && (
                <div className="flex gap-4 bg-[#1e1342]/95 border-2 border-cyan-400/40 rounded-2xl p-3 sm:p-4 shadow-xl flex-1 min-h-0">
                  <div className="flex-1 min-w-0 min-h-0 flex flex-col items-center justify-center gap-2">
                    <div className="flex-1 min-h-0 aspect-square max-w-full">
                      <CoordGrid {...currentActivity.scene(stepIdx)} />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between text-xs font-900 text-slate-300 mb-1">
                        <span>Steps solved</span>
                        <span className="text-amber-300">{Math.min(stepIdx, currentActivity.steps.length)} / {currentActivity.steps.length}</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/15">
                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${(Math.min(stepIdx, currentActivity.steps.length) / currentActivity.steps.length) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="w-64 sm:w-72 shrink-0 flex flex-col gap-2 min-h-0 overflow-y-auto">
                    <p className="text-xs font-900 text-cyan-300 uppercase tracking-wider">Solve it step by step</p>
                    {currentActivity.steps.map((st, i) => {
                      const doneStep = i < stepIdx;
                      const active = i === stepIdx;
                      return (
                        <div
                          key={i}
                          className={`rounded-xl p-2 border-2 transition ${
                            doneStep ? 'bg-emerald-950/70 border-emerald-400/60' : active ? 'bg-[#14082c] border-amber-400/70' : 'bg-[#14082c]/50 border-white/10 opacity-40'
                          }`}
                        >
                          <p className="text-xs font-900 text-slate-100">{i + 1}. {st.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {doneStep ? (
                              <span className="text-sm font-900 text-emerald-300">✔ {fmtN(st.answer)} {st.unit}</span>
                            ) : (
                              <>
                                <input
                                  type="number" disabled={!active} value={active ? stepAns : ''} placeholder="?"
                                  onChange={e => { setStepAns(e.target.value); setStepWrong(false); }}
                                  onKeyDown={e => e.key === 'Enter' && active && checkStep()}
                                  className={inputCls(active && stepWrong ? false : null) + ' flex-1 disabled:opacity-50 !py-1.5'}
                                />
                                <span className="text-xs font-900 text-slate-300">{st.unit}</span>
                                {active && (
                                  <button onClick={checkStep} disabled={stepAns === ''} className="btn-gold text-xs font-900 px-3 py-1.5 disabled:opacity-40">✓</button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex">{hintBtn}</div>
                  </div>
                </div>
              )}

              {/* Hint + feedback strip */}
              {showHint && (
                <div className="p-2.5 mt-2 bg-amber-950/90 border border-amber-400/50 text-amber-200 rounded-xl text-xs sm:text-sm font-bold w-full text-center fade-in-up shrink-0">
                  💡 {currentActivity.hint}
                </div>
              )}
              {feedback && (
                <div className={`p-2.5 mt-2 rounded-2xl text-sm font-900 w-full text-center shadow-xl shrink-0 fade-in-up ${
                  feedback.success ? 'bg-emerald-950/90 text-emerald-300 border-2 border-emerald-400/60' : 'bg-rose-950/90 text-rose-300 border-2 border-rose-400/60'
                }`}>
                  {feedback.text}
                </div>
              )}
            </div>

            {/* Bottom Activity Step Buttons */}
            <div className="flex items-center justify-between border-t border-white/15 pt-3 mt-3 shrink-0">
              <button
                onClick={prevActivity}
                disabled={station === 1 && actIdx === 0}
                className="bg-[#1c0d3a]/90 hover:bg-[#2c1859] border-2 border-white/25 text-white font-display font-900 text-sm sm:text-base px-6 py-2.5 rounded-full cursor-pointer transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
              >
                ← Previous Activity
              </button>

              <button
                onClick={nextActivity}
                className="btn-gold text-sm sm:text-base font-900 px-8 py-2.5 rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer"
              >
                <span>{station === 3 && actIdx === 2 ? 'Go to Practice Phase' : 'Next Activity'}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
