import api from "@/shared/lib/api";
import { deleteAdminCachedData, getAdminCachedData, getAdminCacheScope } from '@/features/performance';
import type { CategoryPayload } from "../types/category";

const toList = (payload: any) => {
  const data = payload?.data;
  return Array.isArray(data) ? data : data?.data || [];
};

export const categoriesService = {
  async getCategories() {
    const warmedCategories = await getAdminCachedData<any[]>(getAdminCacheScope(), 'categories');
    if (warmedCategories) return warmedCategories;

    const response = await api.get("/categorias", { params: { per_page: 100 } });
    return toList(response.data);
  },

  async createCategory(payload: CategoryPayload) {
    await api.post("/categorias", payload);
    void deleteAdminCachedData(getAdminCacheScope(), 'catalog:categories');
    void deleteAdminCachedData(getAdminCacheScope(), 'categories');
  },

  async updateCategory(id: string, payload: CategoryPayload) {
    await api.patch(`/categorias/${id}`, payload);
    void deleteAdminCachedData(getAdminCacheScope(), 'catalog:categories');
    void deleteAdminCachedData(getAdminCacheScope(), 'categories');
  },

  async toggleCategoryStatus(id: string, active: boolean) {
    await api.patch(`/categorias/${id}/ativa`, { ativa: active });
    void deleteAdminCachedData(getAdminCacheScope(), 'catalog:categories');
    void deleteAdminCachedData(getAdminCacheScope(), 'categories');
  },

  async deleteCategory(id: string) {
    await api.delete(`/categorias/${id}`);
    void deleteAdminCachedData(getAdminCacheScope(), 'catalog:categories');
    void deleteAdminCachedData(getAdminCacheScope(), 'categories');
  },
};
