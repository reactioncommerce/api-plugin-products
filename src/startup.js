import Logger from "@reactioncommerce/logger";

/**
 * @summary Extend the schema with updated allowedValues
 * @param {Object} context Startup context
 * @returns {undefined}
 */
async function extendSchemas(context) {
  let allFulfillmentTypesArray = await context.queries.allFulfillmentTypes(context);

  if (!allFulfillmentTypesArray || allFulfillmentTypesArray.length === 0) {
    Logger.warn("No fulfillment types available, setting 'shipping' as default");
    allFulfillmentTypesArray = ["shipping"];
  }

  const { simpleSchemas: { Product } } = context;

  const schemaProductExtension = {
    "supportedFulfillmentTypes": {
      type: Array
    },
    "supportedFulfillmentTypes.$": {
      type: String,
      allowedValues: allFulfillmentTypesArray
    }
  };
  Product.extend(schemaProductExtension);
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function productStartup(context) {
  await extendSchemas(context);
}
