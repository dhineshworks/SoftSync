import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatINR } from "@/lib/format";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/components/ProductCard";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Form = {
  id?: string;
  name: string; slug: string; category: string; description: string;
  price: string; offer_price: string; image_url: string;
  stock_status: string; is_featured: boolean;
};

const blank: Form = { name: "", slug: "", category: "", description: "", price: "", offer_price: "", image_url: "", stock_status: "in_stock", is_featured: false };

function AdminProducts() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(blank);
  const [uploading, setUploading] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.getProducts(),
  });

  const openNew = () => { setForm(blank); setOpen(true); };
  const openEdit = (p: Product & { description?: string }) => {
    setForm({
      id: p.id, name: p.name, slug: p.slug, category: p.category,
      description: (p as { description?: string }).description ?? "",
      price: String(p.price), offer_price: p.offer_price ? String(p.offer_price) : "",
      image_url: p.image_url ?? "", stock_status: p.stock_status, is_featured: !!p.is_featured,
    });
    setOpen(true);
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Image uploaded");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      category: form.category, description: form.description,
      price: Number(form.price), offer_price: form.offer_price ? Number(form.offer_price) : null,
      image_url: form.image_url || null, stock_status: form.stock_status,
      is_featured: form.is_featured,
    };
    try {
      if (form.id) await api.updateProduct(form.id, payload);
      else await api.createProduct(payload);
    } catch (err) {
      toast.error((err as Error).message);
      return;
    }
    toast.success(form.id ? "Product updated" : "Product created");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add, edit, and manage your software catalog.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="rounded-full"><Plus className="mr-1 size-4" /> New product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{form.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" /></div>
              <div><Label>Category</Label><Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. AI Tools" /></div>
              <div><Label>Price (₹)</Label><Input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Offer price (₹)</Label><Input type="number" value={form.offer_price} onChange={(e) => setForm({ ...form, offer_price: e.target.value })} /></div>
              <div><Label>Stock</Label>
                <select value={form.stock_status} onChange={(e) => setForm({ ...form, stock_status: e.target.value })} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="in_stock">In stock</option>
                  <option value="out_of_stock">Out of stock</option>
                </select>
              </div>
              <div className="flex items-end gap-3"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label>Featured</Label></div>
              <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="sm:col-span-2">
                <Label>Image</Label>
                <div className="mt-1 flex gap-3">
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Paste URL or upload" />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-sm hover:bg-accent">
                    <Upload className="size-4" /> {uploading ? "…" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  </label>
                </div>
                {form.image_url && <img src={form.image_url} alt="" className="mt-3 h-24 w-32 rounded-md object-cover" />}
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">{form.id ? "Save changes" : "Create product"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {data?.map((p) => (
          <li key={p.id} className="flex items-center gap-4 py-4">
            <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {p.image_url && <img src={p.image_url} alt={p.name} className="size-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category} · {p.stock_status} {p.is_featured && "· featured"}</p>
            </div>
            <div className="text-sm">
              <p className="font-medium">{formatINR(p.offer_price ?? p.price)}</p>
              {p.offer_price && <p className="text-xs text-muted-foreground line-through">{formatINR(p.price)}</p>}
            </div>
            <button onClick={() => openEdit(p)} className="grid size-9 place-items-center rounded-md hover:bg-accent"><Pencil className="size-4" /></button>
            <button onClick={() => del(p.id)} className="grid size-9 place-items-center rounded-md text-destructive hover:bg-accent"><Trash2 className="size-4" /></button>
          </li>
        ))}
        {(!data || data.length === 0) && <li className="py-12 text-center text-sm text-muted-foreground">No products yet.</li>}
      </ul>
    </div>
  );
}
