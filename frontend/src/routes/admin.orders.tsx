import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.getAllOrders(),
  });

  const setStatus = async (id: string, status: string) => {
    try {
      await api.updateOrderStatus(id, status);
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="text-4xl">Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage incoming customer order requests.</p>

      <ul className="mt-8 space-y-4">
        {data?.map((o) => (
          <li key={o.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{o.customer_name}</p>
                <p className="text-xs text-muted-foreground">{o.email} · {o.phone}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-medium">{formatINR(Number(o.total))}</p>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <ul className="mt-3 grid gap-1 border-t border-border pt-3 text-sm">
              {(o.items as Array<{ name: string; quantity: number; price: number }>).map((i, idx) => (
                <li key={idx} className="flex justify-between text-muted-foreground">
                  <span>{i.name} × {i.quantity}</span>
                  <span>{formatINR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            {o.notes && <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">{o.notes}</p>}
            <a
              href={`https://wa.me/${o.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs text-foreground underline underline-offset-4"
            >
              Message customer on WhatsApp →
            </a>
          </li>
        ))}
        {(!data || data.length === 0) && <li className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No orders yet.</li>}
      </ul>
    </div>
  );
}
