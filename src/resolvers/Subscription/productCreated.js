const productCreated = {
    subscribe: (_, __, context) => context.pubSub.asyncIterator(['PRODUCT_CREATED'])
}

export default productCreated
