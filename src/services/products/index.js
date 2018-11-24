import { writePool, readPool } from '../../db/mysql';

export async function getAllProductsService({ search, limit, offset }) {
  let getQuery = 'SELECT * FROM products p';
  const values = [];

  if (search) {
    getQuery += ' WHERE p.name LIKE "%?%" ';
    values.push(search);
  }

  if (limit && offset) {
    getQuery += ' LIMIT ? OFFSET ?';
    values.push(parseInt(limit, 10), parseInt(offset, 10));
  }

  const result = await readPool.query(getQuery, values);
  return result[0];
}

export async function createProductsService({ name, description, price }) {
  const result = await writePool.query(
    'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
    [name, description, price],
  );
  if (!result[0].affectedRows) {
    return {};
  }
  return {
    productId: result[0].insertId,
    name,
    description,
    price,
  };
}

export async function updateProductsService({
  productId, name, price, description,
}) {
  let updateQuery = 'UPDATE products SET';
  const updates = [];
  const updateValues = [];

  if (name) {
    updates.push(' name = ? ');
    updateValues.push(name);
  }

  if (price) {
    updates.push(' price = ? ');
    updateValues.push(price);
  }

  if (description) {
    updates.push(' description = ? ');
    updateValues.push(description);
  }

  updateQuery = `${updateQuery} ${updates.join()}  WHERE id = ?`;
  await writePool.query(updateQuery, [...updateValues, productId]);
  return {
    productId,
    name,
    price,
    description,
  };
}

export async function deleteProductsService({ productIdCollection }) {
  if (!Array.isArray(productIdCollection)) return;
  await writePool.query('UPDATE products SET is_active = 0 WHERE id IN (?)', [productIdCollection]);
}