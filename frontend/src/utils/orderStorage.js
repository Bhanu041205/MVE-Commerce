const ORDER_STORAGE_PREFIX = 'mvecommerce-recent-orders';

const isBrowser = typeof window !== 'undefined';

const getStorageKey = (userIdentifier) => `${ORDER_STORAGE_PREFIX}:${userIdentifier || 'guest'}`;

const getOrderIdentity = (order) => {
  if (!order) {
    return null;
  }

  return order.id != null ? `id:${order.id}` : (order.orderNumber ? `number:${order.orderNumber}` : null);
};

const sortOrdersByDate = (orders) => {
  return [...orders].sort((left, right) => {
    const leftTime = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right?.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightTime - leftTime;
  });
};

export const getStoredOrders = (userIdentifier) => {
  if (!isBrowser || !userIdentifier) {
    return [];
  }

  try {
    const rawOrders = window.localStorage.getItem(getStorageKey(userIdentifier));
    const parsedOrders = rawOrders ? JSON.parse(rawOrders) : [];
    return Array.isArray(parsedOrders) ? parsedOrders : [];
  } catch (error) {
    return [];
  }
};

export const storeRecentOrder = (userIdentifier, order) => {
  if (!isBrowser || !userIdentifier || !order) {
    return;
  }

  const currentOrders = getStoredOrders(userIdentifier);
  const nextIdentity = getOrderIdentity(order);
  const mergedOrders = [
    order,
    ...currentOrders.filter((currentOrder) => getOrderIdentity(currentOrder) !== nextIdentity),
  ].slice(0, 10);

  window.localStorage.setItem(getStorageKey(userIdentifier), JSON.stringify(sortOrdersByDate(mergedOrders)));
};

export const mergeOrdersWithStored = (userIdentifier, serverOrders) => {
  const storedOrders = getStoredOrders(userIdentifier);
  if (!storedOrders.length) {
    return serverOrders;
  }

  const orderMap = new Map();

  [...storedOrders, ...serverOrders].forEach((order) => {
    const identity = getOrderIdentity(order);
    if (identity) {
      orderMap.set(identity, order);
    }
  });

  return sortOrdersByDate(Array.from(orderMap.values()));
};

export const pruneStoredOrders = (userIdentifier, serverOrders) => {
  if (!isBrowser || !userIdentifier) {
    return;
  }

  const serverIdentities = new Set(serverOrders.map((order) => getOrderIdentity(order)).filter(Boolean));
  const remainingOrders = getStoredOrders(userIdentifier).filter(
    (order) => !serverIdentities.has(getOrderIdentity(order))
  );

  if (remainingOrders.length === 0) {
    window.localStorage.removeItem(getStorageKey(userIdentifier));
    return;
  }

  window.localStorage.setItem(getStorageKey(userIdentifier), JSON.stringify(sortOrdersByDate(remainingOrders)));
};