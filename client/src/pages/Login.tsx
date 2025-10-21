import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      
      if (result.success) {
        toast.success("Login realizado com sucesso!");
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || "Email ou senha incorretos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <img src={APP_LOGO} alt={APP_TITLE} className="w-16 h-16 rounded-lg" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-500">{APP_TITLE}</h1>
            <p className="text-gray-400 text-sm mt-1">Painel Administrativo</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="border border-green-500/30 rounded-lg p-6 bg-green-500/5 space-y-4">
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-gray-900 border-green-500/30 text-white mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gray-900 border-green-500/30 text-white mt-1"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Digite suas credenciais para acessar o painel administrativo
          </p>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 Rauta Tech - Assistência Técnica</p>
        </div>
      </div>
    </div>
  );
}

