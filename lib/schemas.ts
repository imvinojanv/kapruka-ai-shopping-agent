import { z } from "zod";

const responseFormat = z
  .enum(["markdown", "json"])
  .default("json")
  .describe("'markdown' for human-readable output, 'json' for structured data.");

const currency = z
  .enum(["LKR", "USD", "GBP", "AUD", "CAD", "EUR"])
  .default("LKR")
  .describe("Price currency.");

// --- kapruka_list_categories ---

export const listCategoriesParams = z.object({
  params: z.object({
    depth: z
      .number()
      .int()
      .min(1)
      .max(2)
      .default(1)
      .describe("Sub-category levels to include (1 or 2)."),
    response_format: responseFormat,
  }),
});

// --- kapruka_get_product ---

export const getProductParams = z.object({
  params: z.object({
    product_id: z
      .string()
      .min(3)
      .max(80)
      .describe("Kapruka product ID (e.g. 'cake00ka002034')."),
    currency,
    type: z
      .string()
      .nullish()
      .describe("Optional product type hint (e.g. 'specialgifts')."),
    response_format: responseFormat,
  }),
});

// --- kapruka_search_products ---

export const searchProductsParams = z.object({
  params: z.object({
    q: z
      .string()
      .min(3)
      .max(200)
      .describe("Search query. Min 3 chars, must contain specific terms."),
    category: z
      .string()
      .nullish()
      .describe("Category filter (e.g. 'Birthday', 'Cakes', 'Flowers')."),
    limit: z.number().int().min(1).max(50).default(10).describe("Results per page."),
    cursor: z.string().nullish().describe("Pagination cursor from previous response."),
    currency,
    min_price: z.number().min(0).nullish().describe("Min price (inclusive)."),
    max_price: z.number().min(0).nullish().describe("Max price (inclusive)."),
    in_stock_only: z.boolean().default(false).describe("Only return in-stock items."),
    sort: z
      .enum(["relevance", "price_asc", "price_desc", "newest", "bestseller"])
      .default("relevance")
      .describe("Sort order."),
    include_stubs: z
      .boolean()
      .default(false)
      .describe("Include category landing pages."),
    response_format: responseFormat,
  }),
});

// --- kapruka_list_delivery_cities ---

export const listDeliveryCitiesParams = z.object({
  params: z.object({
    query: z
      .string()
      .max(50)
      .nullish()
      .describe("Partial match filter for city name."),
    limit: z.number().int().min(1).max(50).default(25).describe("Max cities to return."),
    response_format: responseFormat,
  }),
});

// --- kapruka_check_delivery ---

export const checkDeliveryParams = z.object({
  params: z.object({
    city: z
      .string()
      .min(2)
      .max(100)
      .describe("Canonical city name (e.g. 'Colombo 03', 'Galle')."),
    delivery_date: z
      .string()
      .nullish()
      .describe("YYYY-MM-DD (Asia/Colombo). Defaults to today."),
    product_id: z
      .string()
      .nullish()
      .describe("Optional product ID for perishable warnings."),
    response_format: responseFormat,
  }),
});

// --- kapruka_create_order ---

const cartItem = z.object({
  product_id: z.string().min(3).max(80).describe("Kapruka product ID."),
  quantity: z.number().int().min(1).max(99).default(1).describe("Quantity (1-99)."),
  icing_text: z
    .string()
    .max(120)
    .nullish()
    .describe("Cake icing text. Ignored for non-cake products."),
});

const recipient = z.object({
  name: z.string().min(1).max(80).describe("Recipient name."),
  phone: z
    .string()
    .min(7)
    .max(30)
    .describe("Phone in E.164 (+9477...) or local (077...) format."),
});

const delivery = z.object({
  address: z.string().min(3).max(250).describe("Street address."),
  city: z.string().min(2).max(100).describe("Kapruka-deliverable city name."),
  location_type: z
    .enum(["house", "apartment", "office", "other"])
    .default("house")
    .describe("Location type."),
  date: z.string().describe("Delivery date YYYY-MM-DD (today or future, Asia/Colombo)."),
  instructions: z
    .string()
    .max(250)
    .nullish()
    .describe("Free-form delivery instructions."),
});

const sender = z.object({
  name: z.string().min(1).max(80).describe("Sender name on gift card."),
  anonymous: z
    .boolean()
    .default(false)
    .describe("If true, shows 'Anonymous' instead of sender name."),
});

export const createOrderParams = z.object({
  params: z.object({
    cart: z.array(cartItem).min(1).max(30).describe("1-30 items."),
    recipient,
    delivery,
    sender,
    gift_message: z.string().max(300).nullish().describe("Optional gift card message."),
    currency,
    response_format: responseFormat,
  }),
});

// --- kapruka_track_order ---

export const trackOrderParams = z.object({
  params: z.object({
    order_number: z
      .string()
      .min(4)
      .max(40)
      .describe("Kapruka order number from confirmation email (e.g. 'VIMP34456CB2')."),
    response_format: responseFormat,
  }),
});
