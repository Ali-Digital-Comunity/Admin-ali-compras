import type { ProductStorePayload } from "../types/product";

export const productSchema = {
  validateStorePayload(payload: ProductStorePayload) {
    return Boolean(payload.produto_id);
  },
};
