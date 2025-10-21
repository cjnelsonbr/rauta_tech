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
import { Plus, Trash2, Edit, AlertCircle, ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
}

interface SubcategoryForm {
  name: string;
  slug: string;
  description: string;
  parentId: string;
}

export default function AdminCategories() {
  const utils = trpc.useUtils();
  const { data: allCategories = [], isLoading } = trpc.categories.list.useQuery();

  const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    slug: "",
    description: "",
  });

  const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryForm>({
    name: "",
    slug: "",
    description: "",
    parentId: "",
  });

  // Separate main categories and subcategories
  const mainCategories = useMemo(() => {
    return allCategories.filter(cat => !cat.parentId);
  }, [allCategories]);

  const getSubcategories = (parentId: string) => {
    return allCategories.filter(cat => cat.parentId === parentId);
  };

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      console.error("Erro ao criar categoria:", error);
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      resetForm();
    },
    onError: (error) => {
      console.error("Erro ao atualizar categoria:", error);
    },
  });

  const deleteM = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
    },
    onError: (error) => {
      console.error("Erro ao deletar categoria:", error);
    },
  });

  const createSubcategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      resetSubcategoryForm();
    },
    onError: (error) => {
      console.error("Erro ao criar subcategoria:", error);
    },
  });

  const updateSubcategoryMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      resetSubcategoryForm();
    },
    onError: (error) => {
      console.error("Erro ao atualizar subcategoria:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
    });
    setEditingId(null);
    setIsOpen(false);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({
      name: "",
      slug: "",
      description: "",
      parentId: "",
    });
    setEditingSubcategoryId(null);
    setIsSubcategoryOpen(false);
  };

  const handleEditCategory = (category: typeof mainCategories[0]) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setEditingId(category.id);
    setIsOpen(true);
  };

  const handleEditSubcategory = (subcategory: typeof allCategories[0]) => {
    setSubcategoryForm({
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || "",
      parentId: subcategory.parentId || "",
    });
    setEditingSubcategoryId(subcategory.id);
    setIsSubcategoryOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      alert("Nome e Slug são obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
        });
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar categoria. Verifique o console.");
    }
  };

  const handleSubcategorySubmit = async () => {
    if (!subcategoryForm.name || !subcategoryForm.slug || !subcategoryForm.parentId) {
      alert("Nome, Slug e Categoria Principal são obrigatórios");
      return;
    }

    try {
      if (editingSubcategoryId) {
        await updateSubcategoryMutation.mutateAsync({
          id: editingSubcategoryId,
          name: subcategoryForm.name,
          slug: subcategoryForm.slug,
          description: subcategoryForm.description,
        });
      } else {
        await createSubcategoryMutation.mutateAsync({
          name: subcategoryForm.name,
          slug: subcategoryForm.slug,
          description: subcategoryForm.description,
          parentId: subcategoryForm.parentId,
        });
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar subcategoria. Verifique o console.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta categoria? As subcategorias também serão deletadas.")) {
      try {
        await deleteM.mutateAsync({ id });
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao deletar categoria. Verifique o console.");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-500">Gerenciar Categorias</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-green-500/30">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === "categories"
                ? "border-green-500 text-green-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Categorias Principais
          </button>
          <button
            onClick={() => setActiveTab("subcategories")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === "subcategories"
                ? "border-green-500 text-green-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Subcategorias
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <Button
              onClick={() => {
                resetForm();
                setIsOpen(true);
              }}
              className="gap-2 bg-green-500 hover:bg-green-600 text-black"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria Principal
            </Button>

            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Carregando categorias...</div>
            ) : mainCategories.length === 0 ? (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-500">
                  Nenhuma categoria cadastrada. Comece adicionando uma nova categoria.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {mainCategories.map((category) => {
                  const subcategories = getSubcategories(category.id);
                  const hasSubcategories = subcategories.length > 0;

                  return (
                    <div key={category.id} className="border border-green-500/30 rounded-lg overflow-hidden">
                      {/* Main Category Row */}
                      <div className="bg-green-500/5 p-4 flex items-center justify-between hover:bg-green-500/10 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {hasSubcategories && (
                              <button
                                onClick={() =>
                                  setExpandedParent(
                                    expandedParent === category.id ? null : category.id
                                  )
                                }
                                className="text-green-500"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    expandedParent === category.id ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            )}
                            <div>
                              <h3 className="font-bold text-white text-lg">{category.name}</h3>
                              <p className="text-sm text-gray-400">{category.description}</p>
                              {hasSubcategories && (
                                <p className="text-xs text-gray-500 mt-1">{subcategories.length} subcategoria(s)</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-500 hover:bg-blue-500/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {expandedParent === category.id && hasSubcategories && (
                        <div className="border-t border-green-500/20 bg-black">
                          {subcategories.map((subcat) => (
                            <div
                              key={subcat.id}
                              className="p-4 border-b border-green-500/10 flex items-center justify-between hover:bg-green-500/5 transition-colors last:border-b-0 ml-8"
                            >
                              <div>
                                <h4 className="font-semibold text-gray-300">{subcat.name}</h4>
                                <p className="text-xs text-gray-500">{subcat.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSubcategory(subcat)}
                                  className="text-blue-500 hover:bg-blue-500/10"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(subcat.id)}
                                  className="text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dialog para criar/editar categoria principal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="bg-black border border-green-500/30">
                <DialogHeader>
                  <DialogTitle className="text-green-500">
                    {editingId ? "Editar Categoria" : "Nova Categoria Principal"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Nome *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome da categoria"
                      className="bg-gray-900 border-green-500/30 text-white mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Slug *</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      placeholder="slug-da-categoria"
                      className="bg-gray-900 border-green-500/30 text-white mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Descrição</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição da categoria"
                      className="bg-gray-900 border-green-500/30 text-white mt-1"
                      rows={3}
                    />
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
                    disabled={!formData.name || !formData.slug || createMutation.isPending || updateMutation.isPending}
                    className="bg-green-500 hover:bg-green-600 text-black"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Subcategories Tab */}
        {activeTab === "subcategories" && (
          <div className="space-y-6">
            <Button
              onClick={() => {
                resetSubcategoryForm();
                setIsSubcategoryOpen(true);
              }}
              className="gap-2 bg-green-500 hover:bg-green-600 text-black"
            >
              <Plus className="w-4 h-4" />
              Nova Subcategoria
            </Button>

            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Carregando categorias...</div>
            ) : mainCategories.length === 0 ? (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-500">
                  Nenhuma categoria principal disponível. Crie uma categoria principal primeiro.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {mainCategories.map((category) => {
                  const subcategories = getSubcategories(category.id);

                  return (
                    <div key={category.id} className="border border-green-500/30 rounded-lg overflow-hidden">
                      <div className="bg-green-500/5 p-4">
                        <h3 className="font-bold text-white text-lg">{category.name}</h3>
                      </div>
                      {subcategories.length === 0 ? (
                        <div className="p-4 text-gray-500 text-sm">Nenhuma subcategoria</div>
                      ) : (
                        <div className="border-t border-green-500/20">
                          {subcategories.map((subcat) => (
                            <div
                              key={subcat.id}
                              className="p-4 border-b border-green-500/10 flex items-center justify-between hover:bg-green-500/5 transition-colors last:border-b-0"
                            >
                              <div>
                                <h4 className="font-semibold text-white">{subcat.name}</h4>
                                <p className="text-xs text-gray-500">{subcat.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSubcategory(subcat)}
                                  className="text-blue-500 hover:bg-blue-500/10"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(subcat.id)}
                                  className="text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dialog para criar/editar subcategoria */}
            <Dialog open={isSubcategoryOpen} onOpenChange={setIsSubcategoryOpen}>
              <DialogContent className="bg-black border border-green-500/30">
                <DialogHeader>
                  <DialogTitle className="text-green-500">
                    {editingSubcategoryId ? "Editar Subcategoria" : "Nova Subcategoria"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Categoria Principal *</label>
                    <select
                      value={subcategoryForm.parentId}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, parentId: e.target.value })}
                      disabled={!!editingSubcategoryId}
                      className="w-full bg-gray-900 border border-green-500/30 text-white rounded-md p-2 mt-1 disabled:opacity-50"
                    >
                      <option value="">Selecione uma categoria</option>
                      {mainCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Nome *</label>
                    <Input
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                      placeholder="Nome da subcategoria"
                      className="bg-gray-900 border-green-500/30 text-white mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Slug *</label>
                    <Input
                      value={subcategoryForm.slug}
                      onChange={(e) =>
                        setSubcategoryForm({
                          ...subcategoryForm,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      placeholder="slug-da-subcategoria"
                      className="bg-gray-900 border-green-500/30 text-white mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Descrição</label>
                    <Textarea
                      value={subcategoryForm.description}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                      placeholder="Descrição da subcategoria"
                      className="bg-gray-900 border-green-500/30 text-white mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={resetSubcategoryForm}
                    className="border-gray-600 text-gray-400"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubcategorySubmit}
                    disabled={!subcategoryForm.name || !subcategoryForm.slug || !subcategoryForm.parentId || createSubcategoryMutation.isPending || updateSubcategoryMutation.isPending}
                    className="bg-green-500 hover:bg-green-600 text-black"
                  >
                    {createSubcategoryMutation.isPending || updateSubcategoryMutation.isPending ? "Salvando..." : editingSubcategoryId ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

