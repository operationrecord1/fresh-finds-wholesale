import { useState } from "react";
import { toast } from "sonner";
import { getProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { normalizePieces, validateQuantity } from "@/lib/wholesale";

type Row = { sku: string; qty: string };
const blank = (): Row => ({ sku: "", qty: "" });

export function ExpressOrder({ open = false }: { open?: boolean }) {
  const { add, lines } = useCart();
  const [rows, setRows] = useState<Row[]>([blank(), blank(), blank()]);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (list: Row[]) => {
    const errs: string[] = []; let added = 0;
    const quantities = new Map(lines.map(line => [line.sku, line.pieces]));
    list.filter((r) => r.sku.trim()).forEach((r) => {
      const p = getProduct(r.sku.trim());
      if (!p) { errs.push(`${r.sku}: item not found`); return; }
      if (!p.rules || p.price == null) { errs.push(`${p.sku}: purchasing data not verified`); return; }
      const requested = Number(r.qty);
      if (!Number.isSafeInteger(requested) || requested <= 0) { errs.push(`${p.sku}: enter a whole quantity greater than zero`); return; }
      const q = normalizePieces(requested, p.rules); // preserve the existing lot-round-up behavior
      const existing = quantities.get(p.sku) ?? 0;
      const error = validateQuantity(q, "piece", p.rules, p.stock, existing);
      if (error) { errs.push(`${p.sku}: ${error}`); return; }
      if (add(p.sku, q) === false) { errs.push(`${p.sku}: the requested quantity is no longer available`); return; }
      quantities.set(p.sku, existing + q);
      added++;
    });
    setErrors(errs); if (added) toast.success(`${added} item(s) added to order`);
  };
  const onCsv = async (f: File) => {
    const text = await f.text();
    const parsed = text.split(/\r?\n/).slice(1).map((l) => l.split(",")).filter((c) => c[0]).map(([sku, qty]) => ({ sku: (sku ?? "").trim(), qty: (qty ?? "").trim() }));
    submit(parsed);
  };

  return (
    <details open={open} className="rounded bg-card p-4">
      <summary className="cursor-pointer font-bold">Express Order</summary>
      <p className="mt-2 text-sm text-muted-foreground">Enter item # and quantity. Quantities round up to the nearest quantity break.</p>
      <div className="mt-3 space-y-2">{rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_70px_auto] gap-2">
          <input aria-label="Item #" placeholder="Item #" value={r.sku} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, sku: e.target.value } : x))} className="min-w-0 w-full rounded border p-2" />
          <input aria-label="Qty" placeholder="Qty" value={r.qty} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, qty: e.target.value } : x))} className="min-w-0 w-full rounded border p-2" />
          <button className="text-sm text-destructive" onClick={() => setRows(rows.filter((_, k) => k !== i))}>Remove</button>
        </div>))}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded border px-3 py-1" onClick={() => setRows([...rows, blank()])}>Add More</button>
        <button className="rounded bg-accent px-3 py-1 font-bold text-accent-foreground" onClick={() => submit(rows)}>Add To Order</button>
        <button className="rounded border px-3 py-1" onClick={() => { setRows([blank(), blank(), blank()]); setErrors([]); }}>Reset</button>
      </div>
      <label className="mt-4 block text-sm">Upload CSV (two columns, header: item #, qty)
        <input type="file" accept=".csv" className="mt-1 block w-full min-w-0" onChange={(e) => e.target.files?.[0] && onCsv(e.target.files[0])} />
      </label>
      {errors.length > 0 && <ul className="mt-2 text-sm text-destructive">{errors.map((e, i) => <li key={`${i}:${e}`}>{e}</li>)}</ul>}
    </details>
  );
}
