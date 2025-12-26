"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Play, RotateCcw, Plus, ArrowRight, Info } from "lucide-react";


const SPEED = 800;

export default function DifferenceArrayVisualizer() {
  // --- State Variables ---
  const [inputStr, setInputStr] = useState("10,20,30,40,50");
  const [original, setOriginal] = useState<number[]>([]);
  const [diffArray, setDiffArray] = useState<number[]>([]);
  const [finalArr, setFinalArr] = useState<number[]>([]);
  
  // Update Inputs
  const [updateL, setUpdateL] = useState(1);
  const [updateR, setUpdateR] = useState(3);
  const [updateX, setUpdateX] = useState(10);

  // Animation State
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [secondaryIdx, setSecondaryIdx] = useState<number | null>(null);
  const [status, setStatus] = useState("Initialize the array to begin.");

  // --- Logic ---
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const initArray = useCallback(() => {
    const nums = inputStr.split(",").map((v) => parseInt(v.trim()) || 0);
    setOriginal(nums);
    
    // Construct Initial Difference Array: D[0]=A[0], D[i]=A[i]-A[i-1]
    const diff = new Array(nums.length).fill(0);
    diff[0] = nums[0];
    for (let i = 1; i < nums.length; i++) {
      diff[i] = nums[i] - nums[i - 1];
    }
    
    setDiffArray(diff);
    setFinalArr(new Array(nums.length).fill(0));
    setStatus("Difference array initialized. Formula: D[i] = A[i] - A[i-1]");
  }, [inputStr]);

  const handleUpdate = async () => {
    if (isAnimating) return;
    if (updateL < 0 || updateR >= original.length || updateL > updateR) {
      setStatus("Error: Invalid L or R bounds.");
      return;
    }

    setIsAnimating(true);
    const nextDiff = [...diffArray];

    // Step 1: D[L] += X
    setStatus(`Step 1: Adding ${updateX} to index L (${updateL})`);
    setActiveIdx(updateL);
    await sleep(SPEED);
    nextDiff[updateL] += updateX;
    setDiffArray([...nextDiff]);
    await sleep(SPEED);

    // Step 2: D[R+1] -= X
    if (updateR + 1 < original.length) {
      setStatus(`Step 2: Subtracting ${updateX} from index R+1 (${updateR + 1})`);
      setActiveIdx(null);
      setSecondaryIdx(updateR + 1);
      await sleep(SPEED);
      nextDiff[updateR + 1] -= updateX;
      setDiffArray([...nextDiff]);
      await sleep(SPEED);
    } else {
      setStatus("Step 2: R+1 is out of bounds, no subtraction needed.");
      await sleep(SPEED);
    }

    setActiveIdx(null);
    setSecondaryIdx(null);
    setIsAnimating(false);
    setStatus(`Update [${updateL}, ${updateR}] by ${updateX} completed.`);
  };

  const buildFinal = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStatus("Building final array: Final[i] = PrefixSum(Diff, i)");

    const build = new Array(original.length).fill(0);
    let runningSum = 0;

    for (let i = 0; i < diffArray.length; i++) {
      setActiveIdx(i);
      runningSum += diffArray[i];
      build[i] = runningSum;
      setFinalArr([...build]);
      await sleep(SPEED);
    }

    setActiveIdx(null);
    setIsAnimating(false);
    setStatus("Final values calculated via Prefix Sum of the Difference Array.");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-950 text-slate-100 min-h-screen font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Difference Array Visualizer
        </h1>
       
      </header>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <section className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Initialization</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              className="flex-1 bg-black border border-slate-700 rounded px-3 py-2 text-cyan-400 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. 1,2,3,4"
            />
            <button onClick={initArray} className="bg-slate-100 text-slate-950 px-4 py-2 rounded font-bold hover:bg-white transition-colors">
              <RotateCcw size={18} />
            </button>
          </div>
        </section>

        <section className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Range Update (L, R, Value)</h3>
          <div className="flex gap-2">
            <input type="number" value={updateL} onChange={(e) => setUpdateL(+e.target.value)} className="w-full bg-black border border-slate-700 rounded px-2 py-2 text-center" placeholder="L" />
            <input type="number" value={updateR} onChange={(e) => setUpdateR(+e.target.value)} className="w-full bg-black border border-slate-700 rounded px-2 py-2 text-center" placeholder="R" />
            <input type="number" value={updateX} onChange={(e) => setUpdateX(+e.target.value)} className="w-full bg-black border border-slate-700 rounded px-2 py-2 text-center" placeholder="Value" />
            <button 
              onClick={handleUpdate} 
              disabled={isAnimating || original.length === 0}
              className="bg-emerald-500 text-white px-6 py-2 rounded font-bold hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={18} /> Apply
            </button>
          </div>
        </section>
      </div>

      {/* Status Message */}
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-4 rounded-lg mb-8 flex items-start gap-3">
        <Info className="mt-1 flex-shrink-0" size={18} />
        <p className="text-sm leading-relaxed">{status}</p>
      </div>

      {/* Visualization Area */}
      <div className="space-y-10">
        <ArrayRow title="Original Array (A)" data={original} active={null} color="text-slate-400" />
        
        <ArrayRow 
          title="Difference Array (D)" 
          data={diffArray} 
          active={activeIdx} 
          secondary={secondaryIdx}
          color="text-emerald-400" 
          showFormulas={true}
        />

        <div className="flex justify-center py-4">
          <button 
            onClick={buildFinal}
            disabled={isAnimating || original.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 disabled:opacity-50"
          >
            <Play size={18} /> Construct Final Array (Prefix Sum)
          </button>
        </div>

        <ArrayRow title="Resulting Array" data={finalArr} active={activeIdx} color="text-blue-400" />
      </div>
    </div>
  );
}

// --- Sub-Components ---

function ArrayRow({ 
    title, 
    data, 
    active, 
    secondary, 
    color, 
    showFormulas = false 
}: { 
    title: string; 
    data: number[]; 
    active: number | null; 
    secondary?: number | null; 
    color: string;
    showFormulas?: boolean;
}) {
  return (
    <div>
      <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${color}`}>{title}</h2>
      <div className="flex flex-wrap gap-3">
        {data.length === 0 && <div className="h-16 w-full border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 italic">No data</div>}
        {data.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl border-2 transition-all duration-500 text-lg font-mono
              ${active === i ? "border-yellow-400 bg-yellow-400/20 scale-110 z-10" : 
                secondary === i ? "border-red-500 bg-red-500/20 scale-110 z-10" : 
                "border-slate-800 bg-slate-900"}`}
            >
              {val}
            </div>
            <span className="text-[10px] text-slate-600 font-bold">idx: {i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}