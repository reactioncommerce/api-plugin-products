import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import products from "./products";

mockContext.queries.products = jest.fn().mockName("queries.products").mockReturnValue(Promise.resolve([]))

test("Testing products, should accepts parameters", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  const args = {
    shopIds: ["SHOP_ID"],
    filters: { isArchived: true },
    isVisible: true,
  }

  const doNothing = () => null;
  await products({}, args, mockContext, {}).catch(doNothing);
  expect(mockContext.queries.products).toHaveBeenCalledWith(mockContext, expect.objectContaining({
    shopIds: ["SHOP_ID"],
    isVisible: true,
    isArchived: true,
  }));
});
