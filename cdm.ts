const BASE = "https://digitalcollections.aucegypt.edu/digital/bl/dmwebservices/index.php?q=";

const seg = (s: string) => encodeURIComponent(s);

export async function getCollections() {
  const url = `${BASE}dmGetCollectionList/json`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`dmGetCollectionList failed: ${r.status}`);
  return r.json();
}

export async function getFieldInfo(alias: string) {
  const url = `${BASE}dmGetCollectionFieldInfo/${seg(alias)}/json`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`dmGetCollectionFieldInfo failed for ${alias}`);
  return r.json();
}

type Clause = { fieldNick: string; term: string; mode?: "any"|"all"|"exact" };

function buildDmQueryPath(alias: string, clauses: Clause[], {
  sort = "title",
  max = 25,
  start = 1,
} = {}) {
  const c = clauses.map(cl => `${cl.fieldNick}^${cl.term}^${cl.mode ?? "any"}`).join("/");
  // Signature (simplified): dmQuery/{alias}/{clauses}/{sort}/{maxrecs}/{start}/0/0/0/0/0/0/json
  return `dmQuery/${seg(alias)}/${c}/${seg(sort)}/${max}/${start}/0/0/0/0/0/0/json`;
}

export async function searchCollection(alias: string, clauses: Clause[], opts?: { sort?: string; max?: number; start?: number; }) {
  const url = `${BASE}${buildDmQueryPath(alias, clauses, opts)}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`dmQuery failed: ${r.status}`);
  return r.json();
}

export async function getItemInfo(alias: string, pointer: number | string) {
  const url = `${BASE}dmGetItemInfo/${seg(alias)}/${seg(String(pointer))}/json`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`dmGetItemInfo failed: ${r.status}`);
  return r.json();
}

export async function getCompoundInfo(alias: string, pointer: number | string) {
  const url = `${BASE}dmGetCompoundObjectInfo/${seg(alias)}/${seg(String(pointer))}/json`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`dmGetCompoundObjectInfo failed: ${r.status}`);
  return r.json();
}

export async function getItemUrl(alias: string, pointer: number | string) {
  const url = `${BASE}dmGetItemUrl/${seg(alias)}/${seg(String(pointer))}/json`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`dmGetItemUrl failed: ${r.status}`);
  return r.json();
}
