import { NextResponse } from "next/server";
import { searchCollection } from "@/lib/cdm";

const DEFAULT_FIELDS = ["title","subjec","descri"];

export async function POST(req: Request) {
  const body = await req.json();
  const { alias, q, fields = DEFAULT_FIELDS, max = 20, start = 1, sort = "title" } = body || {};
  if (!alias || !q) return new Response("alias and q required", { status: 400 });

  const clauses = fields.map((f: string) => ({ fieldNick: f, term: q, mode: "any" }));
  const results = await searchCollection(alias, clauses, { max, start, sort });

  return NextResponse.json(results);
}
