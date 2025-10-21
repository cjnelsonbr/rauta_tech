import { getDb, getAllCategories, createCategory, getSubcategoriesByParentId } from "./db";

const DEFAULT_CATEGORIES = [
  {
    name: "Películas",
    slug: "peliculas",
    description: "Películas protetoras para telas de celular",
    parentId: null as string | null,
  },
  {
    name: "Capinhas",
    slug: "capinhas",
    description: "Capinhas e cases para proteção do celular",
    parentId: null as string | null,
  },
  {
    name: "Carregadores",
    slug: "carregadores",
    description: "Carregadores e cabos USB",
    parentId: null as string | null,
  },
  {
    name: "Acessórios",
    slug: "acessorios",
    description: "Outros acessórios e peças",
    parentId: null as string | null,
  },
  {
    name: "Manutenção",
    slug: "manutencao",
    description: "Serviços e produtos de manutenção",
    parentId: null as string | null,
  },
];

const SUBCATEGORIES: Record<string, Array<{ name: string; slug: string; description: string }>> = {
  manutencao: [
    {
      name: "Celular",
      slug: "celular",
      description: "Manutenção de celulares",
    },
    {
      name: "Notebook",
      slug: "notebook",
      description: "Manutenção de notebooks",
    },
    {
      name: "Computador",
      slug: "computador",
      description: "Manutenção de computadores",
    },
  ],
};

const TAGS: Record<string, Array<{ name: string; slug: string }>> = {
  "celular": [
    { name: "Android", slug: "android" },
    { name: "Apple", slug: "apple" },
  ],
  "notebook": [
    { name: "Formatação", slug: "formatacao" },
    { name: "Outros", slug: "outros" },
  ],
  "computador": [
    { name: "Formatação", slug: "formatacao" },
    { name: "Outros", slug: "outros" },
  ],
};

export async function initializeCategories() {
  try {
    const db = await getDb();
    if (!db) {
      console.log("[Categories] Database not available, skipping initialization");
      return;
    }

    const existingCategories = await getAllCategories();

    if (existingCategories.length === 0) {
      console.log("[Categories] Initializing default categories...");

      // Create main categories
      const categoryMap: Record<string, string> = {};
      for (const category of DEFAULT_CATEGORIES) {
        const created = await createCategory(category);
        categoryMap[category.slug] = created.id;
        console.log(`[Categories] Created: ${category.name}`);
      }

      // Create subcategories
      for (const [parentSlug, subcats] of Object.entries(SUBCATEGORIES)) {
        const parentId = categoryMap[parentSlug];
        if (parentId) {
          for (const subcat of subcats) {
            const created = await createCategory({
              ...subcat,
              parentId,
            });
            categoryMap[subcat.slug] = created.id;
            console.log(`[Categories] Created subcategory: ${subcat.name}`);

            // Create tags for this subcategory
            const tagsForSubcat = TAGS[subcat.slug];
            if (tagsForSubcat) {
              const { createTag } = await import("./db");
              for (const tag of tagsForSubcat) {
                await createTag({
                  name: tag.name,
                  slug: tag.slug,
                  categoryId: created.id,
                });
                console.log(`[Categories] Created tag: ${tag.name} for ${subcat.name}`);
              }
            }
          }
        }
      }

      console.log("[Categories] Default categories and subcategories initialized successfully");
    } else {
      console.log(`[Categories] Found ${existingCategories.length} existing categories`);
    }
  } catch (error) {
    console.error("[Categories] Failed to initialize categories:", error);
  }
}

