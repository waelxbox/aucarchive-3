'use client';
import { useEffect, useMemo, useState } from 'react';

type Coll = { name: string; alias: string; path?: string };

type Hit = {
  pointer?: number;
  title?: string;
  raw: any;
};

export default function Home() {
  const [collections, setCollections] = useState<Coll[]>([]);
  const [alias, setAlias] = useState<string>("");
  const [q, setQ] = useState<string>("Egyptology");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>(undefined);

  // load collections
  useEffect(() => {
    (async () => {
      setError(undefined);
      try {
        const r = await fetch('/api/collections');
        const data = await r.json();
        const cols = (data?.collections || data || []).map((c: any) => ({ name: c.name, alias: c.alias, path: c.path }));
        setCollections(cols);
        if (cols[0]?.alias) setAlias(cols[0].alias);
      } catch (e:any) {
        setError("Failed to load collections");
      }
    })();
  }, []);

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!alias || !q) return;
    setLoading(true);
    setError(undefined);
    setHits([]);
    try {
      const r = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias, q, max: 20, start: 1 }),
      });
      const data = await r.json();

      const recs: any[] = data?.records || [];
      // Try to normalize different shapes; often a record is an array where the last element is an object with pointer
      const normalized: Hit[] = recs.map((rec: any) => {
        let pointer: number|undefined = undefined;
        let title: string|undefined = undefined;

        if (Array.isArray(rec)) {
          // Heuristics: find object with pointer OR last numeric
          const pobj = rec.find((x: any) => x && typeof x === 'object' && 'pointer' in x);
          pointer = pobj?.pointer ?? (typeof rec[rec.length-1] === 'number' ? rec[rec.length-1] : undefined);
          // Title may be first string-ish entry
          const firstStr = rec.find((x:any) => typeof x === 'string');
          title = typeof firstStr === 'string' ? firstStr : undefined;
        } else if (rec && typeof rec === 'object') {
          pointer = rec.pointer ?? rec.p ?? rec.id;
          title = rec.title ?? rec.ti ?? rec['dc.title'];
        }
        return { pointer, title, raw: rec };
      });

      setHits(normalized);
    } catch (e:any) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (alias && q) onSearch(); }, [alias]);

  return (
    <div className="container py-10">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">AUC Archive Chatbot</h1>
          <a href="https://digitalcollections.aucegypt.edu/" target="_blank" className="text-sm text-slate-300 underline">AUC Digital Archive</a>
        </div>
        <p className="text-slate-300 mt-2 max-w-2xl">Natural-language search over AUC’s CONTENTdm collections. Pick a collection, ask a question, and open items to see full metadata.</p>
      </header>

      <form onSubmit={onSearch} className="card flex flex-col md:flex-row gap-3 sticky top-4 z-10 backdrop-blur supports-[backdrop-filter]:bg-slate-900/40">
        <select value={alias} onChange={(e)=>setAlias(e.target.value)} className="input md:max-w-xs">
          {collections.map(c => <option key={c.alias} value={c.alias}>{c.name}</option>)}
        </select>
        <input className="input flex-1" placeholder="Ask about 'Antiquities Train', 'Egyptian Radio 1934', 'Selim Hassan'…" value={q} onChange={e=>setQ(e.target.value)} />
        <button className="btn md:w-40">Search</button>
      </form>

      {error && <div className="mt-4 text-red-300">{error}</div>}
      {loading && <div className="mt-6">Searching…</div>}

      <section className="mt-6 grid gap-4">
        {hits.map((h, i) => <Result key={i} alias={alias} hit={h} />)}
        {!loading && hits.length === 0 && <div className="text-slate-400">No results yet. Try a broader keyword.</div>}
      </section>

      <footer className="mt-16 text-xs text-slate-400">
        Built with CONTENTdm Server API (dmwebservices). This site calls dmGetCollectionList, dmGetCollectionFieldInfo, dmQuery, dmGetItemInfo, dmGetItemUrl.
      </footer>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-200">{children}</span>;
}

function Result({ alias, hit }: { alias: string; hit: Hit }) {
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!hit.pointer) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/item?alias=${encodeURIComponent(alias)}&pointer=${encodeURIComponent(String(hit.pointer))}`);
      const data = await r.json();
      setMeta(data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    const nxt = !open;
    setOpen(nxt);
    if (nxt && !meta) load();
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-medium">{hit.title || `Item ${hit.pointer ?? ''}`}</div>
          {hit.pointer && <div className="text-xs text-slate-400 mt-1"><Badge>pointer: {hit.pointer}</Badge></div>}
        </div>
        <button className="btn" onClick={toggle}>{open ? "Hide details" : "View details"}</button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          {loading && <div>Loading metadata…</div>}
          {meta?.item && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {Object.entries(meta.item).slice(0, 12).map(([k, v]) => (
                  <div key={k} className="text-sm">
                    <span className="text-slate-400">{k}: </span>
                    <span>{Array.isArray(v) ? v.join('; ') : String(v)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {meta?.url?.url && (
                  <a href={meta.url.url} target="_blank" className="btn inline-block">View on AUC site</a>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-slate-300">Raw JSON</summary>
                  <pre className="text-xs bg-slate-950/60 border border-slate-800 p-3 rounded-xl overflow-auto max-h-80">{JSON.stringify(meta, null, 2)}</pre>
                </details>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
