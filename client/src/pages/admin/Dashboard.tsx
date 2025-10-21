import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Package, Shield, Users } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: twoFaStatus } = trpc.twoFactor.getStatus.useQuery();

  const stats = [
    {
      label: "Produtos",
      value: products.length,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Categorias",
      value: categories.length,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "2FA Status",
      value: twoFaStatus?.isEnabled ? "Ativada" : "Desativada",
      icon: Shield,
      color: twoFaStatus?.isEnabled ? "text-green-500" : "text-yellow-500",
      bgColor: twoFaStatus?.isEnabled ? "bg-green-500/10" : "bg-yellow-500/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-green-500">
            Bem-vindo, {user?.name || user?.email}!
          </h1>
          <p className="text-gray-400 mt-2">Painel de controle da Rauta Tech</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`border border-green-500/30 rounded-lg p-6 ${stat.bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="border border-green-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-500 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Gerenciar Produtos</h3>
              <p className="text-sm text-gray-400">
                Adicione, edite ou remova produtos do catálogo
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Segurança</h3>
              <p className="text-sm text-gray-400">
                Configure autenticação em duas etapas para sua conta
              </p>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        {products.length > 0 && (
          <div className="border border-green-500/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-500 mb-4">Produtos Recentes</h2>
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="text-sm text-gray-400">
                      R$ {(product.price / 100).toFixed(2)}
                    </p>
                  </div>
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

