"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/primitives";
import { formatDuration } from "@/lib/format";
import { seeded } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Recording player. Works with a real audio URL when available; in demo mode
 * (no reachable file) it simulates playback so the timeline & speed controls
 * still behave. Waveform bars are deterministic per call id.
 */
export function AudioPlayer({ src, durationSec, seed = 1, onTimeChange, className }: { src?: string; durationSec: number; seed?: number; onTimeChange?: (t: number) => void; className?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [usingFallback, setUsingFallback] = useState(!src);

  const bars = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: 96 }).map(() => 0.2 + r() * 0.8);
  }, [seed]);

  // Simulated playback when no real audio can be loaded
  useEffect(() => {
    if (!playing || !usingFallback) return;
    const t = setInterval(() => {
      setTime((cur) => {
        const next = Math.min(durationSec, cur + 0.25 * speed);
        if (next >= durationSec) setPlaying(false);
        return next;
      });
    }, 250);
    return () => clearInterval(t);
  }, [playing, usingFallback, speed, durationSec]);

  useEffect(() => onTimeChange?.(time), [time, onTimeChange]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = speed;
    a.volume = muted ? 0 : volume;
  }, [speed, volume, muted]);

  const toggle = async () => {
    const a = audioRef.current;
    if (a && !usingFallback) {
      try {
        if (playing) a.pause();
        else await a.play();
        setPlaying(!playing);
        return;
      } catch {
        setUsingFallback(true);
      }
    }
    if (time >= durationSec) setTime(0);
    setPlaying((p) => !p);
  };

  const seek = (t: number) => {
    setTime(t);
    if (audioRef.current && !usingFallback) audioRef.current.currentTime = t;
  };

  const progress = durationSec ? time / durationSec : 0;

  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-4", className)}>
      {src ? (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onTimeUpdate={(e) => setTime((e.target as HTMLAudioElement).currentTime)}
          onEnded={() => setPlaying(false)}
          onError={() => setUsingFallback(true)}
          className="hidden"
        />
      ) : null}
      <div className="flex items-center gap-4">
        <Button size="icon" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="size-11 rounded-full">
          {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-px" />}
        </Button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="relative flex h-12 w-full items-end gap-[2px] overflow-hidden"
            aria-label="Seek"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - rect.left) / rect.width) * durationSec);
            }}
          >
            {bars.map((h, i) => {
              const played = i / bars.length <= progress;
              return <span key={i} className={cn("flex-1 rounded-sm transition-colors", played ? "bg-primary" : "bg-border-strong")} style={{ height: `${h * 100}%` }} />;
            })}
          </button>
          <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] tabular-nums text-muted">
            <span>{formatDuration(time)}</span>
            <span>{formatDuration(durationSec)}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background-subtle p-0.5">
          {[0.75, 1, 1.25, 1.5, 2].map((s) => (
            <button key={s} type="button" onClick={() => setSpeed(s)} className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums", speed === s ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground")}>
              {s}×
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMuted((m) => !m)} className="text-muted hover:text-foreground" aria-label={muted ? "Unmute" : "Mute"}>
            {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <Slider min={0} max={1} step={0.05} value={[muted ? 0 : volume]} onValueChange={([v]) => { setVolume(v); setMuted(false); }} className="w-24" />
        </div>
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <a href={src ?? "#"} download onClick={(e) => { if (!src || usingFallback) e.preventDefault(); }}>
            <Download /> Download
          </a>
        </Button>
        {usingFallback ? <span className="text-[10px] text-faint">Demo playback</span> : null}
      </div>
    </div>
  );
}
