const MarketplaceApp = (() => {
  const state = {
    listings: [],
    transactions: [],
    pendingFeedback: [],
    securityEvents: [],
    usersMap: {}
  };

  let activeUser = null;
  let currentFilter = 'all';
  let searchQuery = '';

  const qs = (id) => document.getElementById(id);

  const init = async () => {
    if (window.marketplaceSeedReady) {
      try {
        await window.marketplaceSeedReady;
      } catch (error) {
        console.warn('Seed failed', error);
      }
    }
    activeUser = await authDB.getActiveUser();
    UI.toggleAuthPanels(!!activeUser);
    await refresh();
    bindEvents();
    Notifier.requestPermission();
    navigator.serviceWorker?.register('service-worker.js').catch(console.warn);
  };

  const bindEvents = () => {
    qs('signupForm').addEventListener('submit', handleSignup);
    qs('signinForm').addEventListener('submit', handleSignin);
    qs('logoutBtn').addEventListener('click', handleLogout);
    qs('linkAccountBtn').addEventListener('click', handleLinkAccount);
    qs('listItemForm').addEventListener('submit', handleListingSubmit);
    qs('listingGrid').addEventListener('click', handleListingAction);
    qs('feedbackList').addEventListener('click', handleFeedbackSubmit);
    qs('marketFilters').addEventListener('click', (event) => {
      const btn = event.target.closest('[data-filter]');
      if (!btn) return;
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('#marketFilters [data-filter]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderListings();
    });
    qs('searchListings').addEventListener('input', (event) => {
      searchQuery = event.target.value.toLowerCase();
      renderListings();
    });

    qs('scopeSelector').addEventListener('click', (event) => {
      const pill = event.target.closest('[data-scope]');
      if (!pill) return;
      document.querySelectorAll('#scopeSelector [data-scope]').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      qs('listingScope').value = pill.dataset.scope;
    });

    qs('twoFactorToggle').addEventListener('change', (e) => handleSecurityToggle('twoFactorEnabled', e.target.checked));
    qs('escrowToggle').addEventListener('change', (e) => handleSecurityToggle('escrowReady', e.target.checked));
    qs('verifyIdentityBtn').addEventListener('click', handleVerifyIdentity);
    qs('generatePickupCodeBtn').addEventListener('click', handlePickupCode);
    qs('requestEscrowBtn').addEventListener('click', handleEscrowRequest);
  };

  const refresh = async () => {
    state.listings = await listingDB.getAll();
    const users = await db.users.toArray();
    state.usersMap = Object.fromEntries(users.map((user) => [user.id, user]));

    if (activeUser) {
      state.transactions = await transactionDB.getForUser(activeUser.id);
      state.pendingFeedback = await feedbackDB.getPending(activeUser.id);
      state.securityEvents = await securityDB.getForUser(activeUser.id);
      const feedbackStats = await feedbackDB.getForUser(activeUser.id);
      const summary = ReputationEngine.summarizeFeedback(feedbackStats.received);
      UI.renderAccountSummary(activeUser, summary);
      UI.renderFeedbackRequests(state.pendingFeedback);
      UI.renderSecurityEvents(state.securityEvents);
    } else {
      state.transactions = [];
      state.pendingFeedback = [];
      state.securityEvents = [];
      UI.renderFeedbackRequests([]);
      UI.renderSecurityEvents([]);
    }

    renderListings();
    const listingMap = Object.fromEntries(state.listings.map((listing) => [listing.id, listing]));
    UI.renderActivity(state.transactions, listingMap, state.usersMap);
  };

  const renderListings = () => {
    const filtered = state.listings.filter((listing) => {
      if (currentFilter !== 'all' && listing.deliveryScope !== currentFilter) return false;
      if (searchQuery) {
        const blob = `${listing.title} ${listing.description} ${listing.city}`.toLowerCase();
        if (!blob.includes(searchQuery)) return false;
      }
      if (currentFilter === 'local' && activeUser) {
        return listing.city === activeUser.city || listing.radius <= activeUser.radius;
      }
      return true;
    });
    UI.renderListings(filtered, activeUser);
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    const form = event.target;
    const payload = {
      fullName: form.fullName.value,
      email: form.email.value,
      phone: form.phone.value,
      city: form.city.value,
      radius: form.radius.value,
      password: form.password.value,
      linkedAccounts: [],
      identityVerified: false
    };
    const provider = form.linkAccount.value;

    if (!payload.fullName || !payload.email || !payload.password) {
      return Notifier.toast('Name, email, and password are required.', 'error');
    }

    try {
      const id = await authDB.register(payload);
      activeUser = await authDB.setActiveUser(id);
      if (provider && provider !== 'none') {
        activeUser = await authDB.addLinkedAccount(activeUser.id, provider);
        await securityDB.log(activeUser.id, 'link-account', 'approved', `${provider} linked during signup.`);
      }
      const awards = ReputationEngine.award('ACCOUNT_CREATED', activeUser);
      activeUser = await authDB.updateUser(activeUser.id, awards);
      UI.toggleAuthPanels(true);
      Notifier.toast('Account created. You are signed in!', 'success');
      await refresh();
      form.reset();
    } catch (error) {
      Notifier.toast(error.message || 'Unable to create account.', 'error');
    }
  };

  const handleSignin = async (event) => {
    event.preventDefault();
    const form = event.target;
    try {
      activeUser = await authDB.login(form.email.value, form.password.value);
      UI.toggleAuthPanels(true);
      Notifier.toast('Welcome back!', 'success');
      await refresh();
      form.reset();
    } catch (error) {
      Notifier.toast(error.message || 'Unable to sign in.', 'error');
    }
  };

  const handleLogout = async () => {
    await authDB.logout();
    activeUser = null;
    UI.toggleAuthPanels(false);
    Notifier.toast('Signed out.', 'info');
    await refresh();
  };

  const handleLinkAccount = async () => {
    if (!activeUser) return Notifier.toast('Sign in to link accounts.', 'error');
    const provider = qs('linkAccountSelect').value;
    if (provider === 'none') return;
    activeUser = await authDB.addLinkedAccount(activeUser.id, provider);
    await securityDB.log(activeUser.id, 'link-account', 'approved', `${provider} connected.`);
    const awards = ReputationEngine.award('SECURITY_UPGRADE', activeUser, { extraPoints: 10 });
    activeUser = await authDB.updateUser(activeUser.id, awards);
    Notifier.toast(`${provider} linked!`, 'success');
    await refresh();
  };

  const handleListingSubmit = async (event) => {
    event.preventDefault();
    if (!activeUser) return Notifier.toast('Create an account to list items.', 'error');

    const form = event.target;
    const scope = qs('listingScope').value;
    const listing = {
      ownerId: activeUser.id,
      title: form.title.value,
      description: form.description.value,
      category: form.category.value,
      condition: form.condition.value,
      price: Number(form.price.value || 0),
      deliveryScope: scope,
      city: form.city.value || activeUser.city,
      radius: Number(form.radius.value || activeUser.radius || 5),
      shippingOptions: form.shipping.value || 'UPS Ground',
      heroTag: scope === 'local' ? 'Ready for pickup today' : scope === 'online' ? 'Ships in 24h' : 'Pickup or ship within 12h'
    };

    if (!listing.title || !listing.price) {
      return Notifier.toast('Title and price are required.', 'error');
    }

    await listingDB.create(listing);
    const awards = ReputationEngine.award('LISTING_CREATED', activeUser);
    activeUser = await authDB.updateUser(activeUser.id, awards);
    Notifier.toast('Listing published!', 'success');
    form.reset();
    document.querySelectorAll('#scopeSelector [data-scope]').forEach((p, idx) => p.classList.toggle('active', idx === 0));
    qs('listingScope').value = 'local';
    await refresh();
  };

  const handleListingAction = async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    if (!activeUser) return Notifier.toast('Sign in to continue.', 'error');

    const listingId = Number(button.dataset.id);
    const listing = state.listings.find((item) => item.id === listingId);
    if (!listing) return;
    if (listing.ownerId === activeUser.id) return Notifier.toast('This is your listing.', 'info');

    const mode = button.dataset.action;
    const pickupCode = mode === 'local' ? Logistics.createPickupCode() : null;
    const txnId = await transactionDB.create(listing, activeUser.id, mode, {
      pickupCode,
      escrowEnabled: qs('escrowToggle').checked
    });

    const seller = state.usersMap[listing.ownerId] || (await db.users.get(listing.ownerId));
    const buyerAwards = ReputationEngine.award(mode === 'local' ? 'LOCAL_TRADE' : 'ONLINE_TRADE', activeUser, {
      escrow: qs('escrowToggle').checked
    });
    activeUser = await authDB.updateUser(activeUser.id, buyerAwards);

    if (seller) {
      const sellerAwards = ReputationEngine.award(mode === 'local' ? 'LOCAL_TRADE' : 'ONLINE_TRADE', seller, { extraPoints: 8 });
      await authDB.updateUser(seller.id, sellerAwards);
    }

    await securityDB.log(activeUser.id, 'trade', 'logged', `Transaction #${txnId} created (${mode}).`);
    Notifier.toast('Trade started! Check the secure trade center.', 'success');
    if (pickupCode) {
      Notifier.toast(`Pickup PIN: ${pickupCode}`, 'info');
    }
    Notifier.push('Trade started', `${listing.title} (${mode === 'local' ? 'Local pickup' : 'Ship to you'})`);
    await refresh();
  };

  const handleFeedbackSubmit = async (event) => {
    const button = event.target.closest('[data-feedback-submit]');
    if (!button) return;
    if (!activeUser) return;

    const txnId = Number(button.dataset.feedbackSubmit);
    const rating = Number(document.querySelector(`[data-feedback-rating="${txnId}"]`).value);
    const comment = document.querySelector(`[data-feedback-notes="${txnId}"]`).value;
    const txn = state.pendingFeedback.find((item) => item.txn.id === txnId);
    if (!txn) return;

    const revieweeId = txn.txn.buyerId === activeUser.id ? txn.txn.sellerId : txn.txn.buyerId;
    await feedbackDB.add({
      transactionId: txnId,
      reviewerId: activeUser.id,
      revieweeId,
      rating,
      comment,
      tags: rating >= 4 ? ['positive'] : ['needs-attention']
    });

    const awards = ReputationEngine.award('FEEDBACK_LEFT', activeUser, { rating });
    activeUser = await authDB.updateUser(activeUser.id, awards);
    Notifier.toast('Feedback submitted!', 'success');
    await refresh();
  };

  const handleSecurityToggle = async (field, value) => {
    if (!activeUser) return;
    activeUser = await authDB.updateUser(activeUser.id, { [field]: value });
    await securityDB.log(
      activeUser.id,
      field,
      value ? 'approved' : 'disabled',
      value ? `${field} enabled.` : `${field} disabled.`
    );
    if (value) {
      const awards = ReputationEngine.award('SECURITY_UPGRADE', activeUser, {
        identityVerified: field === 'identityVerified',
        twoFactor: field === 'twoFactorEnabled',
        escrow: field === 'escrowReady'
      });
      activeUser = await authDB.updateUser(activeUser.id, awards);
    }
    await refresh();
  };

  const handleVerifyIdentity = async () => {
    if (!activeUser) return;
    if (activeUser.identityVerified) return Notifier.toast('Already verified.', 'info');
    activeUser = await authDB.updateUser(activeUser.id, { identityVerified: true });
    await securityDB.log(activeUser.id, 'id-check', 'approved', 'Instant verification completed.');
    const awards = ReputationEngine.award('SECURITY_UPGRADE', activeUser, { identityVerified: true });
    activeUser = await authDB.updateUser(activeUser.id, awards);
    Notifier.toast('ID verified! Trust score boosted.', 'success');
    await refresh();
  };

  const handlePickupCode = async () => {
    if (!activeUser) return Notifier.toast('Sign in first.', 'error');
    const code = Logistics.createPickupCode();
    qs('pickupCodeDisplay').textContent = `Pickup PIN: ${code}`;
    await securityDB.log(activeUser.id, 'pickup-code', 'generated', `PIN ${code}`);
    Notifier.toast(`Share this PIN with the buyer: ${code}`, 'info');
  };

  const handleEscrowRequest = async () => {
    if (!activeUser) return;
    await securityDB.log(activeUser.id, 'escrow', 'pending', 'Escrow review requested.');
    Notifier.toast('Escrow team notified. Expect confirmation shortly.', 'info');
    await refresh();
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', MarketplaceApp.init);
