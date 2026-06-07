import { executeTool } from "../lib/ai/tool-executor";

async function main() {
  console.log("=== Tool Executor Integration Test ===\n");

  // Test 1: list_categories
  console.log("[1] kapruka_list_categories (depth: 1, json)");
  const categories = await executeTool("kapruka_list_categories", {
    params: { depth: 1, response_format: "json" },
  });
  if (categories.ok) {
    const data = categories.data as Record<string, unknown>;
    const cats = (data.categories ?? data) as Array<{ name: string }>;
    console.log(`  ✓ Got ${Array.isArray(cats) ? cats.length : "?"} categories`);
    if (Array.isArray(cats)) console.log(`    First: ${cats[0]?.name}`);
  } else {
    console.log(`  ✗ Error: ${categories.error}`);
  }

  // Test 2: search_products
  console.log("\n[2] kapruka_search_products (q: 'birthday cake')");
  const search = await executeTool("kapruka_search_products", {
    params: { q: "birthday cake", limit: 3, response_format: "json" },
  });
  if (search.ok) {
    console.log(`  ✓ Raw data keys: ${JSON.stringify(Object.keys(search.data as object))}`);
    const data = search.data as Record<string, unknown>;
    const results = (data.results ?? data.products ?? []) as Array<{ name: string; price?: { amount: number } }>;
    console.log(`  Results count: ${results.length}`);
    results.slice(0, 3).forEach((p) => console.log(`    - ${p.name} (${p.price?.amount ?? "?"})`));
  } else {
    console.log(`  ✗ Error: ${search.error}`);
  }

  // Test 3: list_delivery_cities
  console.log("\n[3] kapruka_list_delivery_cities (query: 'colombo')");
  const cities = await executeTool("kapruka_list_delivery_cities", {
    params: { query: "colombo", limit: 5, response_format: "json" },
  });
  if (cities.ok) {
    const data = cities.data as Record<string, unknown>;
    const cityList = (data.cities ?? []) as Array<{ name: string }>;
    console.log(`  ✓ Got ${cityList.length} cities`);
    cityList.forEach((c) => console.log(`    - ${c.name}`));
  } else {
    console.log(`  ✗ Error: ${cities.error}`);
  }

  // Test 4: check_delivery
  console.log("\n[4] kapruka_check_delivery (city: 'Colombo 03')");
  const delivery = await executeTool("kapruka_check_delivery", {
    params: { city: "Colombo 03", response_format: "json" },
  });
  if (delivery.ok) {
    const data = delivery.data as Record<string, unknown>;
    console.log(`  ✓ Available: ${data.available}, Rate: LKR ${data.rate}, Date: ${data.checked_date}`);
  } else {
    console.log(`  ✗ Error: ${delivery.error}`);
  }

  console.log("\n=== All tests complete ===");
}

main();
