const ReputationEngine = (() => {
  const pointMatrix = {
    ACCOUNT_CREATED: 40,
    LISTING_CREATED: 25,
    LOCAL_TRADE: 55,
    ONLINE_TRADE: 65,
    FEEDBACK_LEFT: 15,
    SECURITY_UPGRADE: 35
  };

  const trustBoost = {
    FIVE_STAR: 4,
    FOUR_STAR: 2,
    VERIFIED_ID: 6,
    TWO_FACTOR: 3,
    ESCROW: 4
  };

  const tiers = [
    { label: 'Neighborhood Starter', min: 0 },
    { label: 'Trusted Scout', min: 200 },
    { label: 'Power Seller', min: 450 },
    { label: 'Community Champion', min: 800 }
  ];

  const normalize = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

  const deriveLevel = (points) => {
    let current = tiers[0].label;
    for (const tier of tiers) {
      if (points >= tier.min) current = tier.label;
    }
    return current;
  };

  const award = (action, user, extras = {}) => {
    const base = pointMatrix[action] || 0;
    let bonus = 0;
    if (extras.rating === 5) bonus += trustBoost.FIVE_STAR;
    if (extras.rating === 4) bonus += trustBoost.FOUR_STAR;
    if (extras.identityVerified) bonus += trustBoost.VERIFIED_ID;
    if (extras.twoFactor) bonus += trustBoost.TWO_FACTOR;
    if (extras.escrow) bonus += trustBoost.ESCROW;

    const points = (user.points || 0) + base + (extras.extraPoints || 0);
    const trustScore = normalize((user.trustScore || 55) + bonus);
    const level = deriveLevel(points);
    return { points, trustScore, level };
  };

  const summarizeFeedback = (feedback = []) => {
    if (feedback.length === 0) return { avg: null, total: 0 };
    const total = feedback.reduce((sum, item) => sum + (item.rating || 0), 0);
    const avg = Math.round((total / feedback.length) * 10) / 10;
    return { avg, total: feedback.length };
  };

  return { award, summarizeFeedback };
})();
