import { tool } from "ai";

import {
  listCategoriesParams,
  getProductParams,
  searchProductsParams,
  listDeliveryCitiesParams,
  checkDeliveryParams,
  createOrderParams,
  trackOrderParams,
} from "@/lib/schemas";
import { executeTool } from "@/lib/ai/tool-executor";

export function createToolRegistry() {
  return {
    kapruka_list_categories: tool({
      description:
        "List top-level Kapruka product categories with browse URLs. Returns category names usable as the category filter on search.",
      inputSchema: listCategoriesParams,
      execute: async (input) => executeTool("kapruka_list_categories", input),
    }),

    kapruka_get_product: tool({
      description:
        "Fetch full details for a single Kapruka product by its product ID. Returns name, price, stock, images, variants, shipping info.",
      inputSchema: getProductParams,
      execute: async (input) => executeTool("kapruka_get_product", input),
    }),

    kapruka_search_products: tool({
      description:
        "Search for products on Kapruka.com by keyword with optional category filter and pagination. Returns ranked list with prices and stock status.",
      inputSchema: searchProductsParams,
      execute: async (input) => executeTool("kapruka_search_products", input),
    }),

    kapruka_list_delivery_cities: tool({
      description:
        "List or search Sri Lankan cities Kapruka delivers to. Use the query param to filter. Returns canonical city names for use in check_delivery and create_order.",
      inputSchema: listDeliveryCitiesParams,
      execute: async (input) => executeTool("kapruka_list_delivery_cities", input),
    }),

    kapruka_check_delivery: tool({
      description:
        "Check whether Kapruka can deliver to a given city on a given date, and at what rate. Returns availability, flat delivery rate in LKR, and perishable warnings.",
      inputSchema: checkDeliveryParams,
      execute: async (input) => executeTool("kapruka_check_delivery", input),
    }),

    kapruka_create_order: tool({
      description:
        "Create a guest-checkout order on Kapruka and return a click-to-pay link. Requires cart, recipient, delivery, and sender info. Checkout URL expires in 60 minutes.",
      inputSchema: createOrderParams,
      execute: async (input) => executeTool("kapruka_create_order", input),
    }),

    kapruka_track_order: tool({
      description:
        "Look up status and delivery progress for a Kapruka order by order number (from confirmation email after payment, NOT the order_ref from create_order).",
      inputSchema: trackOrderParams,
      execute: async (input) => executeTool("kapruka_track_order", input),
    }),
  };
}
