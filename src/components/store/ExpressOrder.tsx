import { useState } from "react";
import { toast } from "sonner";
import { getProduct } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { normalizePieces } from "@/lib/wholesale";

type Row = { sku: string; qty: string };
const blank = (): Row => ({ sku: "", qty: "" });

export function ExpressOrder({ open = false }: { open?: boolean }) {
  const { add } = useCart();
  const [rows, setRows] = useState<Row[]>([blank(), blank(), blank()]);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (list: Row[]) => {
    const errs: string[] = []; let added = 0;
    list.filter((r) => r.sku.trim()).forEach((r) => {
      const p = getProduct(r.sku.trim());
      if (!p) return errs.push(`${r.sku}: item not found`);
      if (!p.rules || p.price == null) return errs.push(`${p.sku}: purchasing data not verified`);
      const q = normalizePieces(Number(r.qty) || 0, p.rules); // round up to nearest quantity break
      add(p.sku, q); added++;
    });
    setErrors(errs); if (added) toast.success(`${added} item(s) added to order`);
  };
  const onCsv = async (f: File) => {
    const text = await f.text();
    const parsed = text.split(/\r?\n/).slice(1).map((l) => l.split(",")).filter((c) => c[0]).map(([sku, qty]) => ({ sku: sku.trim(), qty: (qty ?? "").trim() }));
    submit(parsed);
  };

  return (
    <details open={open} className="rounded bg-card p-4">
      <summary className="cursor-pointer font-bold">Express Order</summary>
      <p className="mt-2 text-sm text-muted-foreground">Enter item # and quantity. Quantities round up to the nearest quantity break.</p>
      <div className="mt-3 space-y-2">{rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input aria-label="Item #" placeholder="Item #" value={r.sku} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, sku: e.target.value } : x))} className="w-40 rounded border p-2" />
          <input aria-label="Qty" placeholder="Qty" value={r.qty} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, qty: e.target.value } : x))} className="w-24 rounded border p-2" />
          <button className="text-sm text-destructive" onClick={() => setRows(rows.filter((_, k) => k !== i))}>Remove</button>
        </div>))}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded border px-3 py-1" onClick={() => setRows([...rows, blank()])}>Add More</button>
        <button className="rounded bg-accent px-3 py-1 font-bold text-accent-foreground" onClick={() => submit(rows)}>Add To Order</button>
        <button className="rounded border px-3 py-1" onClick={() => { setRows([blank(), blank(), blank()]); setErrors([]); }}>Reset</button>
      </div>
      <label className="mt-4 block text-sm">Upload CSV (two columns, header: item #, qty)
        <input type="file" accept=".csv" className="mt-1 block" onChange={(e) => e.target.files?.[0] && onCsv(e.target.files[0])} />
      </label>
      {errors.length > 0 && <ul className="mt-2 text-sm text-destructive">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
    </details>
  );
}
