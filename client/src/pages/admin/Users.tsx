import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit, Trash2, Shield, User } from "lucide-react";
import { toast } from "sonner";

export default function Users() {
  const { data: users = [], refetch } = trpc.users.list.useQuery();
  const updateRoleMutation = trpc.users.updateRole.useMutation();
  const deleteMutation = trpc.users.delete.useMutation();
  const createUserMutation = trpc.auth.createUser.useMutation();
  const updatePasswordMutation = trpc.auth.updatePassword.useMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUserForm, setNewUserForm] = useState({ email: "", password: "", name: "", role: "user" as "admin" | "user" });

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditRole = (user: typeof users[0]) => {
    setEditingId(user.id);
    setSelectedRole(user.role);
    setIsEditOpen(true);
  };

  const handleEditPassword = (userId: string) => {
    setEditingId(userId);
    setNewPassword("");
    setIsPasswordOpen(true);
  };

  const handleSaveRole = async () => {
    if (!editingId) return;

    try {
      await updateRoleMutation.mutateAsync({
        userId: editingId,
        role: selectedRole,
      });
      toast.success("Função do usuário atualizada com sucesso!");
      refetch();
      setIsEditOpen(false);
      setEditingId(null);
    } catch (error) {
      toast.error("Erro ao atualizar função do usuário");
    }
  };

  const handleSavePassword = async () => {
    if (!editingId || !newPassword) {
      toast.error("Preencha a nova senha");
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        userId: editingId,
        password: newPassword,
      });
      toast.success("Senha atualizada com sucesso!");
      refetch();
      setIsPasswordOpen(false);
      setEditingId(null);
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar senha");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Tem certeza que deseja remover este usuário?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ userId });
      toast.success("Usuário removido com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao remover usuário");
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.password || !newUserForm.name) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        email: newUserForm.email,
        password: newUserForm.password,
        name: newUserForm.name,
        role: newUserForm.role,
      });
      toast.success("Usuário criado com sucesso!");
      refetch();
      setIsCreateOpen(false);
      setNewUserForm({ email: "", password: "", name: "", role: "user" });
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-500">Gerenciar Usuários</h1>
            <p className="text-gray-400 mt-2">
              Gerencie os usuários que têm acesso ao painel administrativo
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold"
          >
            + Novo Usuário
          </Button>
        </div>

        {/* Search */}
        <div>
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 border-green-500/30 text-white"
          />
        </div>

        {/* Users Table */}
        {filteredUsers.length > 0 ? (
          <div className="border border-green-500/30 rounded-lg overflow-hidden bg-black">
            <Table>
              <TableHeader className="bg-green-500/10 border-b border-green-500/30">
                <TableRow>
                  <TableHead className="text-green-500">Nome</TableHead>
                  <TableHead className="text-green-500">Email</TableHead>
                  <TableHead className="text-green-500">Função</TableHead>
                  <TableHead className="text-green-500">Método de Login</TableHead>
                  <TableHead className="text-green-500 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                    <TableCell className="text-white">{user.name || "N/A"}</TableCell>
                    <TableCell className="text-gray-400">{user.email || "N/A"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> Usuário
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400">{user.loginMethod || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(user)}
                        className="text-blue-500 hover:bg-blue-500/10"
                        title="Alterar função"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPassword(user.id)}
                        className="text-yellow-500 hover:bg-yellow-500/10"
                        title="Alterar senha"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:bg-red-500/10"
                        title="Remover usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Nenhum usuário encontrado</p>
          </div>
        )}

        {/* Dialog para editar função */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-black border border-green-500/30">
            <DialogHeader>
              <DialogTitle className="text-green-500">Alterar Função do Usuário</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Função</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "admin" | "user")}
                  className="w-full bg-gray-900 border border-green-500/30 text-white rounded-md p-2 mt-1"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-gray-600 text-gray-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveRole}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para alterar senha */}
        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <DialogContent className="bg-black border border-green-500/30">
            <DialogHeader>
              <DialogTitle className="text-green-500">Alterar Senha do Usuário</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Nova Senha</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-gray-900 border-green-500/30 text-white mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPasswordOpen(false)}
                className="border-gray-600 text-gray-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePassword}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                Atualizar Senha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para criar novo usuário */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-black border border-green-500/30">
            <DialogHeader>
              <DialogTitle className="text-green-500">Criar Novo Usuário</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Nome</label>
                <Input
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Nome completo"
                  className="bg-gray-900 border-green-500/30 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <Input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="email@example.com"
                  className="bg-gray-900 border-green-500/30 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Senha</label>
                <Input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="bg-gray-900 border-green-500/30 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Função</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as "admin" | "user" })}
                  className="w-full bg-gray-900 border border-green-500/30 text-white rounded-md p-2 mt-1"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-gray-600 text-gray-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateUser}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

