import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type ApiUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type EditForm = {
  id: string;
  full_name: string;
  phone: string;
  role: "user" | "business" | "admin";
  credits: number;
};

function AdminUsers() {
  const qc = useQueryClient();
  const [filterRole, setFilterRole] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<EditForm | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.getAdminUsers(),
  });

  const openEdit = (user: ApiUser) => {
    setEditingUser({
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      credits: user.credits ?? 0,
    });
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      await api.updateAdminUser(editingUser.id, {
        role: editingUser.role,
        credits: editingUser.role === "business" ? Number(editingUser.credits) : 0,
        fullName: editingUser.full_name,
        phone: editingUser.phone,
      });
      toast.success("User updated successfully");
      setOpen(false);
      setEditingUser(null);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete account: ${name || id}?`)) return;
    try {
      await api.deleteAdminUser(id);
      toast.success("User deleted successfully");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const filteredUsers = users?.filter((u) => {
    if (filterRole === "all") return true;
    return u.role === filterRole;
  });

  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl">Users</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage user accounts, assign roles, and grant credits.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { id: "all", label: "All Users" },
          { id: "business", label: "Business Owners" },
          { id: "user", label: "Customers" },
          { id: "admin", label: "Admins" },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={filterRole === tab.id ? "default" : "outline"}
            onClick={() => setFilterRole(tab.id)}
            size="sm"
            className="rounded-full"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Users Table */}
      <div className="mt-8 rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Loading users…</div>
        ) : !filteredUsers || filteredUsers.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">No users found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Name / Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead className="w-[100px] pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-6 py-4">
                    <div className="font-medium text-foreground">{u.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground">{u.phone || "—"}</TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={
                        u.role === "admin"
                          ? "destructive"
                          : u.role === "business"
                            ? "default"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {u.role === "business" ? "business owner" : u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 font-semibold">
                    {u.role === "business" ? `${u.credits ?? 0} cr` : "—"}
                  </TableCell>
                  <TableCell className="pr-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(u)}
                        title="Edit User"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(u.id, u.full_name)}
                        title="Delete User"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit User Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile & Settings</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-role">Account Role</Label>
                <select
                  id="edit-role"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as "user" | "business" | "admin",
                    })
                  }
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="user">Customer (user)</option>
                  <option value="business">Business Owner (business)</option>
                  <option value="admin">Administrator (admin)</option>
                </select>
              </div>

              {editingUser.role === "business" && (
                <div>
                  <Label htmlFor="edit-credits">Credits Balance</Label>
                  <Input
                    id="edit-credits"
                    type="number"
                    min={0}
                    value={editingUser.credits}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, credits: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
