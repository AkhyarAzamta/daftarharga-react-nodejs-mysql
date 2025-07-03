// Helper function untuk mengelompokkan berdasarkan provider
export const groupByProvider = (products) => {
  return products.reduce((result, product) => {
    const provider = product.provider || 'Unknown';
    const category = product.category || 'Uncategorized';

    if (!result[provider]) {
      result[provider] = {
        name: provider,
        categories: {},
      };
    }

    if (!result[provider].categories[category]) {
      result[provider].categories[category] = [];
    }

    result[provider].categories[category].push(product);

    return result;
  }, {});
};

// Helper function untuk mengelompokkan berdasarkan kategori
export const groupByCategory = (products) => {
  return products.reduce((result, product) => {
    const category = product.category || 'Uncategorized';

    if (!result[category]) {
      result[category] = [];
    }

    result[category].push(product);

    return result;
  }, {});
};