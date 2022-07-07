import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import applyProductFilters from "./applyProductFilters";


describe("Test metafields search methods", () => {
  const mockProductFilters = {
    filters: undefined,
    productIds: undefined,
    shopIds: ["mockShopId"],
    tagIds: undefined,
    query: undefined,
    isArchived: undefined,
    isVisible: undefined,
    isExactMatch: false, // selector user fuzzy search if false, exact match if true
    metafieldKey: "mockMetafieldKey",
    metafieldValue: "mockMetafieldValue",
    priceMin: undefined,
    priceMax: undefined
  };

  it("isExactMatch parameter is false", () => {
    const expectedSelector = {
      ancestors: [],
      isDeleted: { $ne: true },
      shopId: { $in: ["mockShopId"] },
      metafields: {
        $elemMatch: {
          key: {
            $options: "i",
            $regex: "mockMetafieldKey"
          },
          value: {
            $options: "i",
            $regex: "mockMetafieldValue"
          }
        }
      }
    };
    const actualSelector = (applyProductFilters(mockContext, mockProductFilters));
    expect(actualSelector).toEqual(expectedSelector);
  });

  it("isExactMatch parameter is true", () => {
    mockProductFilters.isExactMatch = true;
    const expectedSelector = {
      ancestors: [],
      isDeleted: { $ne: true },
      shopId: { $in: ["mockShopId"] },
      metafields: {
        $elemMatch: {
          key: "mockMetafieldKey",
          value: "mockMetafieldValue"
        }
      }
    };
    const actualSelector = (applyProductFilters(mockContext, mockProductFilters));
    expect(actualSelector).toEqual(expectedSelector);
  });

  it("Without isExactMatch parameter", () => {
    delete mockProductFilters.isExactMatch;
    const expectedSelector = {
      ancestors: [],
      isDeleted: { $ne: true },
      shopId: { $in: ["mockShopId"] },
      metafields: {
        $elemMatch: {
          key: {
            $options: "i",
            $regex: "mockMetafieldKey"
          },
          value: {
            $options: "i",
            $regex: "mockMetafieldValue"
          }
        }
      }
    };
    const actualSelector = (applyProductFilters(mockContext, mockProductFilters));
    expect(actualSelector).toEqual(expectedSelector);
  });

  it("should apply the filters to selector", () => {
    mockProductFilters.filters = {
      shopIds: ["mockShopId", "mockShopId2"],
      tagIds: ["mockTagId"],
      productIds: ["mockProductId"],
      query: "mockQuery",
      isArchived: false,
      isVisible: true,
      isExactMatch: false,
      metafieldKey: "mockMetafieldKey",
      metafieldValue: "mockMetafieldValue",
      priceMin: 100,
      priceMax: 1000
    };
    const expectedSelector = {
      "_id": { $in: ["mockProductId"] },
      "shopId": { $in: ["mockShopId", "mockShopId2"] },
      "hashtags": { $in: ["mockTagId"] },
      "ancestors": [],
      "isDeleted": false,
      "isVisible": true,
      "metafields": {
        $elemMatch: {
          key: {
            $options: "i",
            $regex: "mockMetafieldKey"
          },
          value: {
            $options: "i",
            $regex: "mockMetafieldValue"
          }
        }
      },
      "$or": [
        {
          title: { $options: "i", $regex: "mockQuery" }
        },
        {
          pageTitle: { $options: "i", $regex: "mockQuery" }
        },
        {
          description: { $options: "i", $regex: "mockQuery" }
        }
      ],
      "price.max": {
        $lte: 1000
      },
      "price.min": {
        $gte: 100
      }
    };
    const actualSelector = applyProductFilters(mockContext, mockProductFilters);
    expect(actualSelector).toEqual(expectedSelector);
  });
});
