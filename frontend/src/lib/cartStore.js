import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          const updatedItems = items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
          set({
            items: updatedItems,
            total: get().total + product.price,
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }],
            total: get().total + product.price,
          });
        }
      },

      removeItem: (productId) => {
        const items = get().items;
        const itemToRemove = items.find((item) => item.id === productId);

        if (itemToRemove) {
          set({
            items: items.filter((item) => item.id !== productId),
            total: get().total - itemToRemove.price * itemToRemove.quantity,
          });
        }
      },

      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: "cart-storage",
    },
  ),
);
