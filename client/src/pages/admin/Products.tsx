import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  subcategoryId: string;
  imageUrl: string;
  customMessage: string;
}

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: products = [], isLoading } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    subcategoryId: "",
    imageUrl: "",
    customMessage: "",
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      resetForm();
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      resetForm();
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      subcategoryId: "",
      imageUrl: "",
      customMessage: "",
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (product: typeof products[0]) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: (product.price / 100).toFixed(2),
      categoryId: product.categoryId,
      subcategoryId: "",
      imageUrl: product.imageUrl || "",
      customMessage: product.customMessage || "",
    });
    setEditingId(product.id);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId || !formData.price) {
      return;
    }

    // Determine which category to use (subcategory if selected, otherwise main category)
    const finalCategoryId = formData.subcategoryId || formData.categoryId;

    const priceInCents = Math.round(parseFloat(formData.price) * 100);

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        name: formData.name,
        description: formData.description,
        price: priceInCents,
        categoryId: finalCategoryId,
        imageUrl: formData.imageUrl,
        customMessage: formData.customMessage,
      });
    } else {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        price: priceInCents,
        categoryId: finalCategoryId,
        imageUrl: formData.imageUrl,
        customMessage: formData.customMessage,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  // Get subcategories for selected category
  const subcategories = useMemo(() => {
    if (!formData.categoryId) return [];
    return categories.filter(cat => cat.parentId === formData.categoryId);
  }, [formData.categoryId, categories]);

  // Reset subcategory when main category changes
  const handleCategoryChange = (newCategoryId: string) => {
    setFormData({
      ...formData,
      categoryId: newCategoryId,
      subcategoryId: "",
    });
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Sem categoria";
  };

  // Get main categories only (no subcategories)
  const mainCategories = categories.filter(cat => !cat.parentId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-500">Gerenciar Produtos</h1>
          <Button
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
            className="gap-2 bg-green-500 hover:bg-green-600 text-black"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              Nenhum produto cadastrado. Comece adicionando um novo produto.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="border border-green-500/30 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-green-500/10 border-b border-green-500/30">
                <TableRow>
                  <TableHead className="text-green-500">Nome</TableHead>
                  <TableHead className="text-green-500">Categoria</TableHead>
                  <TableHead className="text-green-500">Preço</TableHead>
                  <TableHead className="text-green-500 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-b border-green-500/20 hover:bg-green-500/5">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell>R$ {(product.price / 100).toFixed(2)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="text-blue-500 hover:bg-blue-500/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog para criar/editar produto */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-black border border-green-500/30 max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-green-500">
                {editingId ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do produto"
                  className="bg-gray-900 border-green-500/30 text-white mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do produto"
                  className="bg-gray-900 border-green-500/30 text-white mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Preço (R$) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="bg-gray-900 border-green-500/30 text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">Categoria *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-gray-900 border border-green-500/30 text-white rounded-md p-2 mt-1"
                  >
                    <option value="">Selecione uma categoria</option>
                    {mainCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subcategory field - only show if selected category has subcategories */}
              {subcategories.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400">Subcategoria</label>
                  <select
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                    className="w-full bg-gray-900 border border-green-500/30 text-white rounded-md p-2 mt-1"
                  >
                    <option value="">Selecione uma subcategoria (opcional)</option>
                    {subcategories.map((subcat) => (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400">URL da Imagem</label>
                <Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="bg-gray-900 border-green-500/30 text-white mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Mensagem Personalizada para WhatsApp</label>
                <Textarea
                  value={formData.customMessage}
                  onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                  placeholder="Ex: Olá! Tenho interesse neste produto...\n\nDeixe em branco para usar a mensagem padrão"
                  className="bg-gray-900 border-green-500/30 text-white mt-1"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Deixe vazio para usar a mensagem padrão</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-gray-600 text-gray-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.categoryId || !formData.price}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

