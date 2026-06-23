import api from '@/shared/lib/api';
import { deleteAdminCachedData, getAdminCachedData, getAdminCacheScope } from '@/features/performance';
import type { Banner, BannerPayload } from '../types/banner';

const toList = (payload: any): Banner[] => {
  const data = payload?.data;
  return Array.isArray(data) ? data : data?.data || [];
};

export const bannersService = {
  async getBanners() {
    const warmedBanners = await getAdminCachedData<Banner[]>(getAdminCacheScope(), 'banners');
    if (warmedBanners) return warmedBanners;

    const response = await api.get('/banners', { params: { per_page: 100 } });
    return toList(response.data);
  },

  async createBanner(payload: BannerPayload) {
    const response = await api.post('/banners', payload);
    void deleteAdminCachedData(getAdminCacheScope(), 'banners');
    return response.data.data as Banner;
  },

  async updateBanner(id: string, payload: BannerPayload) {
    const response = await api.patch(`/banners/${id}`, payload);
    void deleteAdminCachedData(getAdminCacheScope(), 'banners');
    return response.data.data as Banner;
  },

  async toggleBanner(id: string, ativo: boolean) {
    const response = await api.patch(`/banners/${id}/ativo`, { ativo });
    void deleteAdminCachedData(getAdminCacheScope(), 'banners');
    return response.data.data as Banner;
  },

  async deleteBanner(id: string) {
    await api.delete(`/banners/${id}`);
    void deleteAdminCachedData(getAdminCacheScope(), 'banners');
  },

  async uploadImage(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/banners/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });

    return response.data.data as { url: string; path: string; size: number; content_type: string };
  },

  async reorder(items: Array<{ id: string; prioridade: number }>) {
    const response = await api.patch('/banners/reorder', { items });
    void deleteAdminCachedData(getAdminCacheScope(), 'banners');
    return toList(response.data);
  },
};
