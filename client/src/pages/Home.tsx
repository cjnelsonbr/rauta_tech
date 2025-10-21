import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { ShoppingCart, Lock, Zap, MessageCircle, ArrowRight, Menu, X, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { data: categories = [] } = trpc.categories.list.useQuery();
  
  // Get subcategories for each category
  const mainCategories = categories.filter(cat => !cat.parentId);
  const categorySubcategories: Record<string, typeof categories> = {};
  
  mainCategories.forEach(cat => {
    const subcats = categories.filter(c => c.parentId === cat.id);
    if (subcats.length > 0) {
      categorySubcategories[cat.id] = subcats;
    }
  });

  const handleNavigateToCatalog = () => {
    navigate("/catalog");
  };

  const handleNavigateToCategoryProducts = (categoryId: string) => {
    navigate(`/catalog?category=${categoryId}`);
    setMobileMenuOpen(false);
  };

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "Películas":
        return "🎬";
      case "Capinhas":
        return "📱";
      case "Carregadores":
        return "🔌";
      case "Acessórios":
        return "⚙️";
      case "Manutenção":
        return "🔧";
      case "Celular":
        return "📲";
      case "Notebook":
        return "💻";
      case "Computador":
        return "🖥️";
      default:
        return "📦";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-green-500/30 bg-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.jpg" alt={APP_TITLE} className="w-12 h-12 rounded-lg cursor-pointer" />
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-green-500">{APP_TITLE}</h1>
                <p className="text-xs text-gray-400">Assistência Técnica</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                onClick={handleNavigateToCatalog}
                variant="ghost"
                className="text-gray-400 hover:text-green-500"
              >
                Catálogo
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-green-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Categories Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden space-y-2 pb-4 border-t border-green-500/30 pt-4 max-h-96 overflow-y-auto">
              <Button
                onClick={handleNavigateToCatalog}
                className="w-full justify-start bg-green-500 hover:bg-green-600 text-black text-sm"
              >
                Ver Todos
              </Button>
              {mainCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => handleNavigateToCategoryProducts(category.id)}
                      variant="ghost"
                      className="flex-1 justify-start text-gray-400 hover:text-green-500 text-sm"
                    >
                      {getCategoryIcon(category.name)} {category.name}
                    </Button>
                    {categorySubcategories[category.id] && (
                      <button
                        onClick={() =>
                          setExpandedCategory(
                            expandedCategory === category.id ? null : category.id
                          )
                        }
                        className="px-2 text-green-500"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedCategory === category.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {expandedCategory === category.id &&
                    categorySubcategories[category.id] && (
                      <div className="ml-4 space-y-1 mt-1">
                        {categorySubcategories[category.id].map((subcat) => (
                          <Button
                            key={subcat.id}
                            onClick={() => handleNavigateToCategoryProducts(subcat.id)}
                            variant="ghost"
                            className="w-full justify-start text-gray-500 hover:text-green-400 text-xs"
                          >
                            {getCategoryIcon(subcat.name)} {subcat.name}
                          </Button>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">
                Assistência Técnica de{" "}
                <span className="text-green-500">Celulares</span>
              </h2>
              <p className="text-base md:text-xl text-gray-400">
                Encontre os melhores produtos e acessórios para seu celular. Películas, capinhas, carregadores e muito mais!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleNavigateToCatalog}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold gap-2 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Explorar Catálogo
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => {
                  window.open("https://wa.me/27997681466", "_blank");
                }}
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-500/10 font-semibold gap-2 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-green-500/10 to-black border border-green-500/30 rounded-lg p-8 md:p-12 flex items-center justify-center h-80 md:h-96">
              <ShoppingCart className="w-24 md:w-32 h-24 md:h-32 text-green-500/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-green-500/5 border-y border-green-500/30 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-8 md:mb-12">
            Nossas <span className="text-green-500">Categorias</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {mainCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleNavigateToCategoryProducts(category.id)}
                className="border border-green-500/30 rounded-lg p-6 md:p-8 bg-green-500/5 hover:border-green-500/60 hover:bg-green-500/10 transition-all text-center group"
              >
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">
                  {getCategoryIcon(category.name)}
                </div>
                <h4 className="text-base md:text-lg font-bold text-white group-hover:text-green-500 transition-colors">
                  {category.name}
                </h4>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-8 md:mb-12">
            Por que escolher a <span className="text-green-500">Rauta Tech</span>?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShoppingCart,
                title: "Catálogo Completo",
                description:
                  "Produtos de qualidade com preços competitivos para todas as suas necessidades",
              },
              {
                icon: Zap,
                title: "Atendimento Rápido",
                description:
                  "Suporte via WhatsApp para responder suas dúvidas e processar pedidos rapidamente",
              },
              {
                icon: Lock,
                title: "Segurança",
                description:
                  "Seus dados e transações são protegidos com os mais altos padrões de segurança",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="border border-green-500/30 rounded-lg p-6 bg-black hover:border-green-500/60 transition-colors"
                >
                  <Icon className="w-10 md:w-12 h-10 md:h-12 text-green-500 mb-4" />
                  <h4 className="text-base md:text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm md:text-base text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-500/10 border-y border-green-500/30 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4 md:space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Pronto para começar?
          </h3>
          <p className="text-base md:text-xl text-gray-400">
            Navegue pelo nosso catálogo e encontre exatamente o que você precisa
          </p>
          <Button
            onClick={handleNavigateToCatalog}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold gap-2 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            Ver Catálogo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-500/30 bg-black py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-xs md:text-sm space-y-2">
          <p>© 2024 Rauta Tech - Assistência Técnica de Celulares</p>
          <p>WhatsApp: 27 99768-1466</p>
          <p>Desenvolvido com ❤️ para melhor servir você</p>
        </div>
      </footer>
    </div>
  );
}

