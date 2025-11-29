const db = new Dexie('LocalLinkMarketDB');

// IndexedDB schema (auto-upgrades handled by Dexie)
db.version(1).stores({
  users: '++id, email, phone, city, trustScore',
  listings: '++id, ownerId, deliveryScope, city, status',
  transactions: '++id, listingId, buyerId, sellerId, status, deliveryType',
  feedback: '++id, transactionId, reviewerId, revieweeId, rating, [transactionId+reviewerId]',
  securityEvents: '++id, userId, type, status'
});

const ACTIVE_USER_KEY = 'locallink-active-user';

async function hashPassword(value) {
  if (!value) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  if (crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return btoa(value);
}

const authDB = {
  async register(user) {
    const normalizedEmail = user.email.trim().toLowerCase();
    const existing = await db.users.where('email').equals(normalizedEmail).first();
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = user.passwordHash || (await hashPassword(user.password));
    const newUser = {
      fullName: user.fullName?.trim(),
      email: normalizedEmail,
      phone: user.phone?.trim() || '',
      city: user.city?.trim() || 'Remote',
      radius: Number(user.radius) || 10,
      passwordHash,
      trustScore: user.trustScore ?? 62,
      points: user.points ?? 120,
      level: user.level ?? 'Neighborhood Starter',
      identityVerified: user.identityVerified ?? false,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      escrowReady: user.escrowReady ?? false,
      linkedAccounts: user.linkedAccounts ?? [],
      createdAt: new Date().toISOString()
    };

    return await db.users.add(newUser);
  },

  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.users.where('email').equals(normalizedEmail).first();
    if (!user) throw new Error('Account not found.');

    const incomingHash = await hashPassword(password);
    if (incomingHash !== user.passwordHash) {
      throw new Error('Incorrect password.');
    }

    localStorage.setItem(ACTIVE_USER_KEY, user.id);
    return user;
  },

  async logout() {
    localStorage.removeItem(ACTIVE_USER_KEY);
  },

  async getActiveUser() {
    const id = Number(localStorage.getItem(ACTIVE_USER_KEY));
    if (!id) return null;
    return await db.users.get(id);
  },

  async setActiveUser(id) {
    localStorage.setItem(ACTIVE_USER_KEY, id);
    return await db.users.get(id);
  },

  async updateUser(id, payload) {
    await db.users.update(id, payload);
    return await db.users.get(id);
  },

  async addLinkedAccount(id, provider) {
    const user = await db.users.get(id);
    if (!user) return null;
    const existing = new Set(user.linkedAccounts || []);
    existing.add(provider);
    await db.users.update(id, { linkedAccounts: Array.from(existing) });
    return await db.users.get(id);
  }
};

const listingDB = {
  async create(listing) {
    return await db.listings.add({
      ...listing,
      status: listing.status || 'active',
      createdAt: new Date().toISOString(),
      heroTag: listing.heroTag || 'Verified seller'
    });
  },

  async getAll() {
    return await db.listings.orderBy('id').reverse().toArray();
  },

  async getByOwner(ownerId) {
    return await db.listings.where('ownerId').equals(ownerId).toArray();
  },

  async updateStatus(id, status) {
    await db.listings.update(id, { status });
  }
};

const transactionDB = {
  async create(listing, buyerId, deliveryType, options = {}) {
    const record = {
      listingId: listing.id,
      buyerId,
      sellerId: listing.ownerId,
      deliveryType,
      status: options.status || (deliveryType === 'local' ? 'awaiting-pickup' : 'in-transit'),
      escrowEnabled: options.escrowEnabled ?? true,
      pickupCode: options.pickupCode || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await db.transactions.add(record);
  },

  async getForUser(userId) {
    if (!userId) return [];
    const buyer = await db.transactions.where('buyerId').equals(userId).toArray();
    const seller = await db.transactions.where('sellerId').equals(userId).toArray();
    const merged = [...buyer, ...seller];
    return merged.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  },

  async updateStatus(id, status) {
    await db.transactions.update(id, { status, updatedAt: new Date().toISOString() });
    return await db.transactions.get(id);
  }
};

const feedbackDB = {
  async add(feedback) {
    return await db.feedback.add({
      ...feedback,
      createdAt: new Date().toISOString()
    });
  },

  async getForUser(userId) {
    if (!userId) return [];
    const given = await db.feedback.where('reviewerId').equals(userId).toArray();
    const received = await db.feedback.where('revieweeId').equals(userId).toArray();
    return { given, received };
  },

  async getPending(userId) {
    if (!userId) return [];
    const txns = await transactionDB.getForUser(userId);
    const pending = [];
    for (const txn of txns) {
      if (!['delivered', 'completed'].includes(txn.status)) continue;
      const alreadyLeft = await db.feedback
        .where('[transactionId+reviewerId]')
        .equals([txn.id, userId])
        .first();
      if (!alreadyLeft) {
        const listing = await db.listings.get(txn.listingId);
        pending.push({ txn, listing });
      }
    }
    return pending;
  }
};

const securityDB = {
  async log(userId, type, status = 'pending', message = '') {
    return await db.securityEvents.add({
      userId,
      type,
      status,
      message,
      createdAt: new Date().toISOString()
    });
  },

  async getForUser(userId) {
    if (!userId) return [];
    return await db.securityEvents.where('userId').equals(userId).reverse().toArray();
  }
};

async function seedDemoData() {
  const userCount = await db.users.count();
  if (userCount > 0) return;

  const demoHash = await hashPassword('demo1234');

  const demoSellerId = await db.users.add({
    fullName: 'Harper Lane',
    email: 'demo@locallink.app',
    phone: '+1 555-284-1199',
    city: 'Austin, TX',
    radius: 15,
    passwordHash: demoHash,
    trustScore: 86,
    points: 640,
    level: 'Trusted Power Seller',
    identityVerified: true,
    twoFactorEnabled: true,
    escrowReady: true,
    linkedAccounts: ['PayPal', 'Google Pay'],
    createdAt: new Date().toISOString()
  });

  const buyerId = await db.users.add({
    fullName: 'Mason Riley',
    email: 'buyer@locallink.app',
    phone: '+1 555-820-4411',
    city: 'Austin, TX',
    radius: 8,
    passwordHash: await hashPassword('buyertest'),
    trustScore: 74,
    points: 320,
    level: 'Neighborhood Scout',
    identityVerified: true,
    twoFactorEnabled: false,
    escrowReady: true,
    linkedAccounts: ['Cash App'],
    createdAt: new Date().toISOString()
  });

  const hybridListingId = await listingDB.create({
    ownerId: demoSellerId,
    title: 'Refurb Galaxy Buds2 Pro',
    description: 'White • noise-canceling • includes travel case',
    category: 'Electronics',
    condition: 'Excellent',
    price: 90,
    deliveryScope: 'hybrid',
    city: 'Austin, TX',
    radius: 10,
    shippingOptions: 'USPS Priority',
    heroTag: 'Pickup today or ship in 12h'
  });

  const onlineListingId = await listingDB.create({
    ownerId: demoSellerId,
    title: 'Handmade Macrame Wall Art',
    description: '36" wide neutral tones, includes mounting kit',
    category: 'Home & Decor',
    condition: 'New',
    price: 120,
    deliveryScope: 'online',
    city: 'Austin, TX',
    radius: 0,
    shippingOptions: 'UPS Ground',
    heroTag: 'Ships within 24h'
  });

  await listingDB.create({
    ownerId: buyerId,
    title: 'IKEA Linnmon desk (local only)',
    description: '47" white desk with adjustable legs. Minor scuffs.',
    category: 'Furniture',
    condition: 'Good',
    price: 45,
    deliveryScope: 'local',
    city: 'Austin, TX',
    radius: 5,
    shippingOptions: 'Pickup only',
    heroTag: 'Ground floor pickup'
  });

  const txnId = await transactionDB.create(
    { id: hybridListingId, ownerId: demoSellerId },
    buyerId,
    'local',
    { status: 'delivered', pickupCode: '417920' }
  );

  await feedbackDB.add({
    transactionId: txnId,
    reviewerId: buyerId,
    revieweeId: demoSellerId,
    rating: 5,
    comment: 'Smooth pickup, product as described.',
    tags: ['fast-response', 'verified'],
    createdAt: new Date().toISOString()
  });

  await securityDB.log(demoSellerId, 'id-check', 'approved', 'Government ID verified at signup.');
  await securityDB.log(demoSellerId, 'two-factor', 'approved', 'Authenticator app linked.');
  await securityDB.log(buyerId, 'escrow', 'approved', 'Escrow wallet connected.');
}

window.marketplaceSeedReady = seedDemoData();
