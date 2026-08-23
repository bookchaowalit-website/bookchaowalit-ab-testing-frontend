"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Variant = { id: string; name: string; weight: number; conversions: number; views: number };

const SEED: Variant[] = [
  { id: "control", name: "Control / the quiet baseline", weight: 42, conversions: 12, views: 200 },
  { id: "signal", name: "Signal / direct promise", weight: 33, conversions: 18, views: 190 },
  { id: "proof", name: "Proof / show the evidence", weight: 25, conversions: 10, views: 148 },
];

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        // Hydrate the browser-only experiment after the server-rendered seed.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(JSON.parse(saved) as T);
      }
    } catch {
      // The seed remains useful when storage is unavailable.
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);

  return [value, setValue] as const;
}

export default function Home() {
  const [variants, setVariants] = useLocalStorage<Variant[]>("ab-testing-v2", SEED);
  const allocation = variants.reduce((sum, variant) => sum + variant.weight, 0);
  const totals = useMemo(
    () => ({
      views: variants.reduce((sum, variant) => sum + variant.views, 0),
      conversions: variants.reduce((sum, variant) => sum + variant.conversions, 0),
    }),
    [variants]
  );
  const leader = [...variants].sort((a, b) => b.conversions / b.views - a.conversions / a.views)[0];

  const simulate = (rounds: number) => {
    setVariants((current) => {
      const next = current.map((variant) => ({ ...variant }));
      const total = next.reduce((sum, variant) => sum + variant.weight, 0) || 1;
      for (let round = 0; round < rounds; round += 1) {
        let remaining = Math.random() * total;
        const selected = next.find((variant) => {
          remaining -= variant.weight;
          return remaining <= 0;
        });
        if (selected) selected.views += 1;
      }
      return next;
    });
  };

  const reset = () => setVariants(SEED);

  return (
    <main className="experiment-room">
      <span className="contract-mark" dangerouslySetInnerHTML={{ __html: "<!-- THESIS: traffic is a question; FINISH: weighted allocation, honest rates, local experiment state -->" }} />
      <div className="room-shell">
        <header className="room-topbar">
          <Link href="/" className="room-wordmark">SPLIT / ROOM</Link>
          <span><i aria-hidden="true" /> local experiment · no visitors sent</span>
        </header>

        <section className="room-hero">
          <div>
            <p className="room-kicker">experiment 01 / weighting room</p>
            <h1>Let the traffic answer slowly.</h1>
          </div>
          <p className="room-deck">A small control room for comparing message variants. Adjust the split, simulate traffic, and read the rate without pretending this browser is a production analytics system.</p>
        </section>

        <section className="experiment-layout" aria-labelledby="experiment-heading">
          <div className="experiment-main">
            <header className="section-heading">
              <div><span className="section-code">01</span><h2 id="experiment-heading">The current split</h2></div>
              <span className={allocation === 100 ? "allocation-good" : "allocation-warning"}>{allocation}% allocated</span>
            </header>

            <div className="variant-list">
              {variants.map((variant, index) => {
                const rate = variant.views ? (variant.conversions / variant.views) * 100 : 0;
                return (
                  <article className="variant-row" key={variant.id}>
                    <div className="variant-index">0{index + 1}</div>
                    <div className="variant-content">
                      <div className="variant-title-line"><h3>{variant.name}</h3><strong>{rate.toFixed(1)}%</strong></div>
                      <div className="rate-track" aria-hidden="true"><span style={{ width: `${Math.min(rate * 8, 100)}%` }} /></div>
                      <div className="variant-facts"><span>{variant.views} exposures</span><span>{variant.conversions} conversions</span><label>weight <input aria-label={`${variant.name} traffic weight`} type="range" min="1" max="98" value={variant.weight} onChange={(event) => setVariants((current) => current.map((item) => item.id === variant.id ? { ...item, weight: Number(event.target.value) } : item))} /> <b>{variant.weight}</b></label></div>
                    </div>
                    <button type="button" className="conversion-button" onClick={() => setVariants((current) => current.map((item) => item.id === variant.id ? { ...item, conversions: item.conversions + 1, views: Math.max(item.views, item.conversions + 1) } : item))}>+ conversion</button>
                  </article>
                );
              })}
            </div>

            <div className="room-actions">
              <button type="button" className="primary-button" onClick={() => simulate(1)}>Simulate one visit</button>
              <button type="button" className="quiet-button" onClick={() => simulate(50)}>Run 50 visits</button>
              <button type="button" className="text-button" onClick={reset}>Reset seed</button>
            </div>
            <p className="honesty-note">Simulation uses weighted random selection in this browser. It does not represent real audience behavior, statistical significance, or a deployed experiment.</p>
          </div>

          <aside className="readout" aria-label="Experiment readout">
            <span className="readout-label">Bench readout</span>
            <div className="readout-number">{totals.views}</div><p>total exposures</p>
            <dl>
              <div><dt>Conversions</dt><dd>{totals.conversions}</dd></div>
              <div><dt>Overall rate</dt><dd>{totals.views ? `${((totals.conversions / totals.views) * 100).toFixed(1)}%` : "0.0%"}</dd></div>
              <div><dt>Current lead</dt><dd>{leader?.name.split(" /")[0] ?? "—"}</dd></div>
            </dl>
            <div className="readout-rule" />
            <p className="readout-foot">The useful question is not “who won?” yet. It is “what changed, and what would make this result trustworthy?”</p>
          </aside>
        </section>

        <footer className="room-footer">Local-only portfolio instrument · no cookies, accounts, or external analytics are implied.</footer>
      </div>
    </main>
  );
}
