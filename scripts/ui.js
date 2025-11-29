const UI = (() => {
  const qs = (id) => document.getElementById(id);

  const toggleAuthPanels = (isAuthenticated) => {
    qs('authForms').style.display = isAuthenticated ? 'none' : 'flex';
    qs('accountSummary').style.display = isAuthenticated ? 'block' : 'none';
  };

  const renderAccountSummary = (user, feedbackStats = { avg: null, total: 0 }) => {
    if (!user) return;
    qs('accountName').textContent = user.fullName;
    qs('accountCity').textContent = `${user.city} · ${user.radius} mi radius`;
    qs('accountPoints').textContent = `${user.points || 0} pts`;
    qs('trustScore').textContent = `${user.trustScore || 0}`;
    qs('trustTier').textContent = user.level || 'Starter';
    qs('twoFactorToggle').checked = !!user.twoFactorEnabled;
    qs('escrowToggle').checked = !!user.escrowReady;
    qs('idVerifiedBadge').textContent = user.identityVerified ? 'ID verified' : 'ID pending';
    qs('idVerifiedBadge').className = user.identityVerified ? 'badge' : 'tag';

    const linkedList = qs('linkedAccounts');
    linkedList.innerHTML = '';
    (user.linkedAccounts || []).forEach((provider) => {
      const pill = document.createElement('span');
      pill.className = 'info-pill';
      pill.textContent = provider;
      linkedList.appendChild(pill);
    });

    const feedbackEl = qs('feedbackSummary');
    if (feedbackStats.avg) {
      feedbackEl.textContent = `${feedbackStats.avg} ★ (${feedbackStats.total})`;
    } else {
      feedbackEl.textContent = 'No feedback yet';
    }
  };

  const renderListings = (listings = [], currentUser) => {
    const grid = qs('listingGrid');
    if (!grid) return;
    if (listings.length === 0) {
      grid.innerHTML = '<div class="empty-state">No listings match your filters yet.</div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    listings.forEach((listing) => {
      const card = document.createElement('article');
      card.className = 'listing-card';
      card.dataset.id = listing.id;
      const scopeClass = Logistics.badgeForScope(listing.deliveryScope);
      card.innerHTML = `
        <div class="card-top">
          <div class="status-chip ${scopeClass}">${Logistics.describeScope(listing.deliveryScope)}</div>
          <h3>${listing.title}</h3>
          <p>${listing.description || ''}</p>
        </div>
        <div class="price">$${Number(listing.price).toFixed(2)}</div>
        <div class="info-pills">
          <span class="info-pill">${listing.category}</span>
          <span class="info-pill">${listing.condition}</span>
          <span class="info-pill">${listing.city}</span>
          ${listing.deliveryScope !== 'online' ? `<span class="info-pill">${Logistics.formatRadius(listing.radius)}</span>` : ''}
        </div>
        <div class="card-footer">
          <small>${listing.heroTag || ''}</small>
          <div class="hero-actions">
            <button class="btn btn-secondary action-local" data-action="local" data-id="${listing.id}">Pickup</button>
            <button class="btn btn-primary action-online" data-action="online" data-id="${listing.id}">Ship</button>
          </div>
        </div>
      `;

      if (listing.deliveryScope === 'online') {
        card.querySelector('.action-local').disabled = true;
      }
      if (listing.deliveryScope === 'local') {
        card.querySelector('.action-online').disabled = true;
      }
      if (currentUser && currentUser.id === listing.ownerId) {
        card.querySelectorAll('button').forEach((btn) => (btn.disabled = true));
      }
      fragment.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(fragment);
  };

  const renderFeedbackRequests = (pending) => {
    const container = qs('feedbackList');
    if (!container) return;
    if (!pending || pending.length === 0) {
      container.innerHTML = '<div class="empty-state">No feedback needed right now.</div>';
      return;
    }

    container.innerHTML = '';
    pending.forEach(({ txn, listing }) => {
      const card = document.createElement('div');
      card.className = 'feedback-card';
      card.innerHTML = `
        <div>
          <strong>${listing?.title || 'Listing'}</strong>
          <p style="margin:0.2rem 0; color: var(--text-muted);">${txn.deliveryType === 'local' ? 'Local pickup' : 'Shipped order'}</p>
        </div>
        <label>Rating</label>
        <select data-feedback-rating="${txn.id}">
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Great</option>
          <option value="3">3 - Okay</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Terrible</option>
        </select>
        <textarea placeholder="Share a quick note" data-feedback-notes="${txn.id}"></textarea>
        <button class="btn btn-primary" data-feedback-submit="${txn.id}">Submit feedback</button>
      `;
      container.appendChild(card);
    });
  };

  const renderSecurityEvents = (events = []) => {
    const list = qs('securityTimeline');
    if (!list) return;
    if (events.length === 0) {
      list.innerHTML = '<div class="empty-state">No security events yet.</div>';
      return;
    }

    const items = events
      .slice(0, 4)
      .map(
        (event) => `
        <li>
          <div class="dot"></div>
          <div class="content">
            <strong>${event.type}</strong>
            <p style="margin:0.2rem 0;">${event.message || 'Event logged'}</p>
            <small>${new Date(event.createdAt).toLocaleString()} · ${event.status}</small>
          </div>
        </li>`
      )
      .join('');

    list.innerHTML = items;
  };

  const renderActivity = (transactions = [], listingsMap = {}, usersMap = {}) => {
    const timeline = qs('activityTimeline');
    if (!timeline) return;
    if (transactions.length === 0) {
      timeline.innerHTML = '<div class="empty-state">No trade activity yet.</div>';
      return;
    }

    const items = transactions.slice(0, 5).map((txn) => {
      const listing = listingsMap[txn.listingId];
      const buyer = usersMap[txn.buyerId];
      const seller = usersMap[txn.sellerId];
      return `
        <li>
          <div class="dot"></div>
          <div class="content">
            <strong>${listing?.title || 'Listing'}</strong>
            <p style="margin:0.2rem 0;">${buyer?.fullName || 'Buyer'} ↔ ${seller?.fullName || 'Seller'}</p>
            <small>${txn.status} · ${new Date(txn.updatedAt || txn.createdAt).toLocaleString()}</small>
          </div>
        </li>`;
    });

    timeline.innerHTML = items.join('');
  };

  return {
    toggleAuthPanels,
    renderAccountSummary,
    renderListings,
    renderFeedbackRequests,
    renderSecurityEvents,
    renderActivity
  };
})();
