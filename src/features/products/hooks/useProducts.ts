import { useEffect, useMemo, useState } from "react";
import { productsService } from "../services/productsService";
import type { Product } from "../types/product";

export function useProducts() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const data = await productsService.getActiveCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getStoreProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = (product.nome || "").toLowerCase();
      const productBrand = (product.marca || "").toLowerCase();
      const searchTerm = search.toLowerCase();
      const matchSearch = productName.includes(searchTerm) || productBrand.includes(searchTerm);
      const matchCategory = categoryFilter === "Todas" || product.categoria_nome === categoryFilter;
      const displayStatus = product.ativo_na_loja ? "Ativo" : "Inativo";
      const matchStatus = statusFilter === "Todos" || displayStatus === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [categoryFilter, products, search, statusFilter]);

  const toggleHighlight = async (id: string, currentStatus: boolean) => {
    try {
      await productsService.toggleHighlight(id, !currentStatus);
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === id ? { ...product, destaque: !currentStatus } : product,
        ),
      );
    } catch (error) {
      console.error("Error updating highlight", error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await productsService.toggleStatus(id, !currentStatus);
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === id ? { ...product, ativo_na_loja: !currentStatus } : product,
        ),
      );
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return {
    categories,
    categoryFilter,
    fetchProducts,
    filteredProducts,
    loading,
    products,
    search,
    setCategoryFilter,
    setSearch,
    setStatusFilter,
    statusFilter,
    toggleHighlight,
    toggleStatus,
  };
}
