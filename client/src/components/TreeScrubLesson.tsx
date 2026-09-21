import { useEffect, useMemo, useRef, useState } from "react";
import type { TreeScrubLesson as TreeScrubLessonType } from "../types.js";

// All layout math happens in a fixed coordinate space; the SVG's viewBox
// is what actually pans/zooms as the tree grows, and an HTML bubble layer
// is reprojected into the same space each render (see viewBox below).
const SPACE_W = 640;
const SPACE_H = 820;
const ROOT_POINT = { x: SPACE_W / 2, y: SPACE_H - 50 };
const BASE_LENGTH = 190;
const LENGTH_FALLOFF = 0.82;
const MIN_LENGTH = 60;
const ROOT_WEDGE_DEG = 160;
const MAX_SLICE_DEG = 75;
const VIEW_PAD = 70;
const MIN_VIEW_SIZE = 300;

interface Point {
  x: number;
  y: number;
}

function pointFrom(start: Point, r: number, deg: number): Point {
  const rad = (deg * Math.PI) / 180;
  return { x: start.x + r * Math.sin(rad), y: start.y - r * Math.cos(rad) };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

interface LayoutEntry {
  point: Point;
  angle: number;
  depth: number;
}

// Recursive angular subdivision: node i's whole subtree is confined to an
// angular "wedge" inherited from its own slice among its siblings, so two
// nodes sharing a parentIndex (any number of them) never cross into each
// other's territory, at any depth - the fix for "objects with the same
// hierarchy" colliding. A node with exactly one child doesn't fork, so it
// continues straight in the same direction without consuming any of the
// wedge (that's how a single unbranched run - a root's only child, say -
// reads as one continuous branch rather than an oddly-angled kink).
function computeLayout(nodes: { parentIndex: number }[]): LayoutEntry[] {
  const childrenOf: number[][] = nodes.map(() => []);
  for (let i = 1; i < nodes.length; i++) childrenOf[nodes[i].parentIndex].push(i);

  const layout: LayoutEntry[] = new Array(nodes.length);
  layout[0] = { point: ROOT_POINT, angle: 0, depth: 0 };

  function place(i: number, wedge: number) {
    const children = childrenOf[i];
    if (children.length === 0) return;
    const length = Math.max(MIN_LENGTH, BASE_LENGTH * Math.pow(LENGTH_FALLOFF, layout[i].depth));
    if (children.length === 1) {
      const childAngle = layout[i].angle;
      const point = pointFrom(layout[i].point, length, childAngle);
      layout[children[0]] = { point, angle: childAngle, depth: layout[i].depth + 1 };
      place(children[0], wedge);
      return;
    }
    const perChild = Math.min(wedge / children.length, MAX_SLICE_DEG);
    const totalSpread = perChild * children.length;
    children.forEach((childIndex, slot) => {
      const childAngle = layout[i].angle - totalSpread / 2 + perChild * (slot + 0.5);
      const point = pointFrom(layout[i].point, length, childAngle);
      layout[childIndex] = { point, angle: childAngle, depth: layout[i].depth + 1 };
      place(childIndex, perChild);
    });
  }

  place(0, ROOT_WEDGE_DEG);
  return layout;
}

interface ScheduleEntry {
  nodeStart: number;
  nodeWindow: number;
  segStart: number;
  segWindow: number;
}

// Admins don't hand-tune reveal timing per node (unlike the source
// mockup) - it's derived from a breadth-first walk of the tree, so it
// grows outward level by level, with each node's slot evenly spaced
// across the scroll range.
function computeSchedule(nodes: { parentIndex: number }[]): ScheduleEntry[] {
  const childrenOf: number[][] = nodes.map(() => []);
  for (let i = 1; i < nodes.length; i++) childrenOf[nodes[i].parentIndex].push(i);

  const order: number[] = [0];
  const queue = [0];
  while (queue.length) {
    const current = queue.shift()!;
    for (const child of childrenOf[current]) {
      order.push(child);
      queue.push(child);
    }
  }

  const total = nodes.length;
  const step = 1 / total;
  const schedule: ScheduleEntry[] = new Array(total);
  order.forEach((originalIndex, k) => {
    const nodeStart = k * step;
    const nodeWindow = step * 1.4;
    const segWindow = step * 1.8;
    const segStart = Math.max(0, nodeStart - segWindow * 0.55);
    schedule[originalIndex] = { nodeStart, nodeWindow, segStart, segWindow };
  });
  return schedule;
}

export function TreeScrubLesson({ content, isComplete = false, onComplete = () => {} }: {
  content: TreeScrubLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const nodes = content.nodes;
  const layout = useMemo(() => computeLayout(nodes), [nodes]);
  const schedule = useMemo(() => computeSchedule(nodes), [nodes]);
  const total = nodes.length;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [currentFraction, setCurrentFraction] = useState(0);
  const targetRef = useRef(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const isCompleteRef = useRef(isComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    isCompleteRef.current = isComplete;
  });

  useEffect(() => {
    let rafId: number | null = null;
    let scrollTicking = false;

    function tick() {
      const target = targetRef.current;
      if (target >= 0.98 && !completedRef.current) {
        completedRef.current = true;
        if (!isCompleteRef.current) onCompleteRef.current();
      }
      setCurrentFraction((prev) => {
        const next = prev + (target - prev) * 0.15;
        const done = Math.abs(target - next) < 0.0005;
        rafId = done ? null : requestAnimationFrame(tick);
        return done ? target : next;
      });
    }

    function ensureLoop() {
      if (rafId == null) rafId = requestAnimationFrame(tick);
    }

    function updateTarget() {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollRoom = rect.height - window.innerHeight;
      targetRef.current = scrollRoom > 0 ? clamp01(-rect.top / scrollRoom) : 1;
      ensureLoop();
    }

    function onScroll() {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateTarget();
        scrollTicking = false;
      });
    }

    updateTarget();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateTarget);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateTarget);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  function nodeAppear(i: number): number {
    const s = schedule[i];
    return clamp01((currentFraction - s.nodeStart) / s.nodeWindow);
  }
  function segGrowth(i: number): number {
    const s = schedule[i];
    return clamp01((currentFraction - s.segStart) / s.segWindow);
  }

  // The view zooms out to keep pace with growth: at any point it fits
  // just the nodes/branches revealed so far (padded, with a floor so it
  // never zooms in absurdly tight on a lone root), ending on the whole
  // tree once everything has appeared - so a large tree never has to
  // render at a tiny fixed scale from the first frame.
  const viewBox = useMemo(() => {
    let minX = ROOT_POINT.x;
    let maxX = ROOT_POINT.x;
    let minY = ROOT_POINT.y;
    let maxY = ROOT_POINT.y;
    for (let i = 0; i < total; i++) {
      const active = i === 0 || segGrowth(i) > 0;
      if (!active) continue;
      const p = layout[i].point;
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    let w = Math.max(maxX - minX + VIEW_PAD * 2, MIN_VIEW_SIZE);
    let h = Math.max(maxY - minY + VIEW_PAD * 2, MIN_VIEW_SIZE);
    const aspect = SPACE_W / SPACE_H;
    if (w / h > aspect) h = w / aspect;
    else w = h * aspect;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFraction, layout, total]);

  const progressPercent = Math.round(currentFraction * 100);

  return (
    <div className="treescrub-lesson">
      <div className="treescrub-lesson-wrapper" ref={wrapperRef} style={{ height: `${Math.min(500, Math.max(180, total * 42))}vh` }}>
        <div className="treescrub-lesson-sticky">
          <div className="treescrub-lesson-box">
            <svg
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
              className="treescrub-lesson-svg"
              aria-hidden="true"
            >
              <g>
                {nodes.map((node, i) => {
                  if (i === 0) return null;
                  const from = layout[node.parentIndex].point;
                  const to = layout[i].point;
                  const growth = segGrowth(i);
                  const x2 = from.x + (to.x - from.x) * growth;
                  const y2 = from.y + (to.y - from.y) * growth;
                  const width = Math.max(2, 6 - layout[i].depth * 1.1);
                  return (
                    <line
                      key={i}
                      x1={from.x}
                      y1={from.y}
                      x2={x2}
                      y2={y2}
                      className="treescrub-lesson-branch"
                      strokeWidth={width}
                    />
                  );
                })}
              </g>
              <g>
                {nodes.map((_, i) => {
                  const appear = nodeAppear(i);
                  if (appear <= 0) return null;
                  const p = layout[i].point;
                  return (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={6}
                      className="treescrub-lesson-dot"
                      style={{ opacity: appear }}
                    />
                  );
                })}
              </g>
            </svg>
            <div className="treescrub-lesson-bubbles">
              {nodes.map((node, i) => {
                const appear = nodeAppear(i);
                if (appear <= 0) return null;
                const p = layout[i].point;
                const leftPct = ((p.x - viewBox.x) / viewBox.w) * 100;
                const topPct = ((p.y - viewBox.y) / viewBox.h) * 100;
                return (
                  <div
                    key={i}
                    className="treescrub-lesson-bubble"
                    style={{
                      // A pure percentage doesn't know the bubble's own
                      // fixed pixel width, so a sibling positioned near an
                      // edge could clip against the box - clamp in terms
                      // of --treescrub-bubble-half (half the bubble's
                      // width, set in App.css per breakpoint).
                      left: `clamp(var(--treescrub-bubble-half), ${leftPct}%, calc(100% - var(--treescrub-bubble-half)))`,
                      top: `${topPct}%`,
                      opacity: appear,
                      transform: `translate(-50%, -130%) scale(${0.6 + 0.4 * appear})`,
                    }}
                  >
                    <div className="treescrub-lesson-bubble-title">{node.title}</div>
                    <div className="treescrub-lesson-bubble-body">{node.body}</div>
                  </div>
                );
              })}
            </div>
            <div className="treescrub-lesson-progress">
              {currentFraction >= 0.98 ? "complete" : `progress ${progressPercent}%`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
