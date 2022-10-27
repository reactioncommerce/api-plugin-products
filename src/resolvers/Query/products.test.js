import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import products from "./products";

const mockNavigationItemsQuery = getFakeMongoCursor("products", Promise.resolve([]));
mockContext.queries.products = jest.fn().mockName("queries.products").mockReturnValue(mockNavigationItemsQuery);

test("products query should accepts parameters", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  const args = {
    shopIds: ["SHOP_ID"],
    filters: { isArchived: true },
    isVisible: true
  };

  await products({}, args, mockContext, { fieldNodes: [] });
  expect(mockContext.queries.products).toHaveBeenCalledWith(mockContext, expect.objectContaining({
    shopIds: ["SHOP_ID"],
    isVisible: true,
    isArchived: true
  }));
});
