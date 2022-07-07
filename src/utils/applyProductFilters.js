import SimpleSchema from "simpl-schema";

const schema = {
  "productIds": {
    type: Array,
    optional: true
  },
  "productIds.$": String,
  "shopIds": {
    type: Array,
    optional: true
  },
  "shopIds.$": String,
  "tagIds": {
    type: Array,
    optional: true
  },
  "tagIds.$": String,
  "query": {
    type: String,
    optional: true
  },
  "isArchived": {
    type: Boolean,
    optional: true
  },
  "isVisible": {
    type: Boolean,
    optional: true
  },
  "metafieldKey": {
    type: String,
    optional: true
  },
  "metafieldValue": {
    type: String,
    optional: true
  },
  "priceMin": {
    type: Number,
    optional: true
  },
  "priceMax": {
    type: Number,
    optional: true
  },
  "isExactMatch": {
    type: Boolean,
    optional: true,
    defaultValue: false
  }
};

const filters = new SimpleSchema({
  filters: {
    type: new SimpleSchema(schema),
    optional: true
  },
  ...schema
});

/**
 * @name applyProductFilters
 * @summary Builds a selector for Products collection, given a set of filters
 * @private
 * @param {Object} context - an object containing the per-request state
 * @param {Object} productFilters - See filters schema above
 * @returns {Object} Selector
 */
export default function applyProductFilters(context, productFilters) {
  // if there are filter/params that don't match the schema
  filters.validate(productFilters);

  // Init default selector - Everyone can see products that fit this selector
  let selector = {
    ancestors: [], // Lookup top-level products
    isDeleted: { $ne: true } // by default, we don't publish deleted products
  };

  if (productFilters) {
    let filterData = { ...productFilters };

    if (filterData.filters) {
      filterData = { ...filterData, ...filterData.filters };
    }

    // filter by productIds
    if (filterData.productIds) {
      selector = {
        ...selector,
        _id: {
          $in: filterData.productIds
        }
      };
    }

    if (filterData.shopIds) {
      selector = {
        ...selector,
        shopId: {
          $in: filterData.shopIds
        }
      };
    }

    // filter by tags
    if (filterData.tagIds) {
      selector = {
        ...selector,
        hashtags: {
          $in: filterData.tagIds
        }
      };
    }

    // filter by query
    if (filterData.query) {
      const cond = {
        $regex: filterData.query,
        $options: "i"
      };
      selector = {
        ...selector,
        $or: [
          {
            title: cond
          },
          {
            pageTitle: cond
          },
          {
            description: cond
          }
        ]
      };
    }

    // filter by details
    if (filterData.metafieldKey && filterData.metafieldValue) {
      let keyCondition;
      let valueCondition;

      // Set the search condition based on isFuzzySearch flag
      if (filterData.isExactMatch) {
        keyCondition = filterData.metafieldKey;
        valueCondition = filterData.metafieldValue;
      } else {
        keyCondition = {
          $regex: filterData.metafieldKey,
          $options: "i"
        };
        valueCondition = {
          $regex: filterData.metafieldValue,
          $options: "i"
        };
      }

      selector = {
        ...selector,
        metafields: {
          $elemMatch: {
            key: keyCondition,
            value: valueCondition
          }
        }
      };
    }

    // filter by visibility
    if (filterData.isVisible !== undefined) {
      selector = {
        ...selector,
        isVisible: filterData.isVisible
      };
    }

    // filter by archived
    if (filterData.isArchived !== undefined) {
      selector = {
        ...selector,
        isDeleted: filterData.isArchived
      };
    }

    // filter by gte minimum price
    if (filterData.priceMin && !filterData.priceMax) {
      selector = {
        ...selector,
        "price.min": {
          $gte: parseFloat(filterData.priceMin)
        }
      };
    }

    // filter by lte maximum price
    if (filterData.priceMax && !filterData.priceMin) {
      selector = {
        ...selector,
        "price.max": {
          $lte: parseFloat(filterData.priceMax)
        }
      };
    }

    // filter with a price range
    if (filterData.priceMin && filterData.priceMax) {
      const priceMin = parseFloat(filterData.priceMin);
      const priceMax = parseFloat(filterData.priceMax);

      // Filters a whose min and max price range are within the
      // range supplied from the filter
      selector = {
        ...selector,
        "price.min": {
          $gte: priceMin
        },
        "price.max": {
          $lte: priceMax
        }
      };
    }
  } // end if productFilters

  return selector;
}
