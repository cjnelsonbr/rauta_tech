import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

const WHATSAPP_NUMBER = "27997681466";

export default function Catalog() {
  const navigate = useLocation()[1];
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("category");
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Separate main categories and subcategories
  const mainCategories = useMemo(() => {
    return categories.filter(cat => !cat.parentId);
  }, [categories]);

  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    
    return products.filter((product) => {
      let matchesCategory = false;
      
      if (product.categoryId === selectedCategory) {
        matchesCategory = true;
      } else {
        const selectedCat = categories.find(c => c.id === selectedCategory);
        if (selectedCat && !selectedCat.parentId) {
          const subcats = getSubcategories(selectedCategory);
          matchesCategory = subcats.some(subcat => subcat.id === product.categoryId);
        }
      }
      
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery, categories]);

  const handleWhatsAppClick = (product: typeof products[0]) => {
    let message = "";
    
    if (product.customMessage) {
      // Se houver mensagem personalizada, usar ela
      message = product.customMessage;
    } else {
      // Caso contrário, usar mensagem padrão
      message = `Olá! Gostaria de informações sobre o produto:\n\n*${product.name}*\nPreço: R$ ${(product.price / 100).toFixed(2)}`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
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
      {/* Header */}
      <header className="border-b border-green-500/30 bg-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src="/logo.jpg" alt="Rauta Tech" className="w-10 h-10 md:w-12 md:h-12 rounded-lg cursor-pointer" />
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-2xl font-bold text-green-500">Rauta Tech</h1>
                <p className="text-xs text-gray-400">Catálogo</p>
              </div>
            </button>

            {/* Mobile Filter Button */}
            <button
              className="md:hidden text-green-500"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              {mobileFiltersOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-green-500/30 text-white placeholder-gray-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar - Categories */}
          <aside
            className={`md:col-span-1 ${
              mobileFiltersOpen ? "block" : "hidden md:block"
            }`}
          >
            <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5 sticky top-24 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-bold text-green-500 mb-4">Categorias</h2>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className={`w-full justify-start text-sm md:text-base ${
                    selectedCategory === null
                      ? "bg-green-500 text-black hover:bg-green-600"
                      : "text-gray-400 hover:text-white hover:bg-green-500/10"
                  }`}
                  onClick={() => {
                    setSelectedCategory(null);
                    setMobileFiltersOpen(false);
                    setSearchQuery("");
                  }}
                >
                  Todos os Produtos
                </Button>

                {mainCategories.map((category) => {
                  const subcategories = getSubcategories(category.id);
                  const hasSubcategories = subcategories.length > 0;

                  return (
                    <div key={category.id}>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className={`flex-1 justify-start text-sm md:text-base ${
                            selectedCategory === category.id
                              ? "bg-green-500 text-black hover:bg-green-600"
                              : "text-gray-400 hover:text-white hover:bg-green-500/10"
                          }`}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setMobileFiltersOpen(false);
                          }}
                        >
                          {getCategoryIcon(category.name)} {category.name}
                        </Button>
                        {hasSubcategories && (
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

                      {/* Subcategories */}
                      {expandedCategory === category.id && hasSubcategories && (
                        <div className="ml-4 space-y-1 mt-1">
                          {subcategories.map((subcat) => (
                            <Button
                              key={subcat.id}
                              variant={selectedCategory === subcat.id ? "default" : "ghost"}
                              className={`w-full justify-start text-xs md:text-sm ${
                                selectedCategory === subcat.id
                                  ? "bg-green-500 text-black hover:bg-green-600"
                                  : "text-gray-500 hover:text-green-400 hover:bg-green-500/5"
                              }`}
                              onClick={() => {
                                setSelectedCategory(subcat.id);
                                setMobileFiltersOpen(false);
                              }}
                            >
                              {getCategoryIcon(subcat.name)} {subcat.name}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-base md:text-lg">
                  {!selectedCategory
                    ? "Selecione uma categoria para ver os produtos"
                    : searchQuery
                    ? "Nenhum produto encontrado com essa busca"
                    : "Nenhum produto disponível nesta categoria"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-green-500/30 rounded-lg overflow-hidden bg-gray-900/50 hover:border-green-500/60 transition-colors group flex flex-col"
                  >
                    {/* Product Image */}
                    {product.imageUrl ? (
                      <div className="relative h-40 sm:h-48 overflow-hidden bg-black">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="h-40 sm:h-48 bg-gray-800 flex items-center justify-center">
                        <ShoppingCart className="w-10 sm:w-12 h-10 sm:h-12 text-gray-600" />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="p-3 md:p-4 space-y-3 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm md:text-lg line-clamp-2">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs md:text-sm text-gray-400 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="border-t border-green-500/20 pt-2 md:pt-3">
                        <p className="text-xl md:text-2xl font-bold text-green-500">
                          R$ {(product.price / 100).toFixed(2)}
                        </p>
                      </div>

                      {/* WhatsApp Button */}
                      <Button
                        onClick={() => handleWhatsAppClick(product)}
                        className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold gap-2 text-sm md:text-base py-2 md:py-3"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Comprar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-500/30 mt-8 md:mt-12 py-6 md:py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-xs md:text-sm">
          <p>© 2024 Rauta Tech - Assistência Técnica de Celulares</p>
          <p className="mt-2">WhatsApp: {WHATSAPP_NUMBER}</p>
        </div>
      </footer>
    </div>
  );
}

