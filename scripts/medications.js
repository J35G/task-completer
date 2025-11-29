const Logistics = (() => {
  const shippingETAMap = {
    'USPS Priority': '2-3 days domestic',
    'UPS Ground': '3-5 business days',
    'FedEx Express': 'Overnight or 2 day',
    'Local Courier': 'Same day'
  };

  const createPickupCode = () => {
    return Math.random().toString().slice(2, 8).padEnd(6, '0');
  };

  const formatRadius = (miles = 5) => `${miles} mi pickup radius`;

  const describeScope = (scope) => {
    if (scope === 'local') return 'Local pickup only';
    if (scope === 'online') return 'Ships nationwide';
    return 'Pickup or ship';
  };

  const getShippingEta = (method) => shippingETAMap[method] || 'Ships in 1-3 days';

  const badgeForScope = (scope) => {
    if (scope === 'local') return 'status-local';
    if (scope === 'online') return 'status-online';
    return 'status-hybrid';
  };

  return { createPickupCode, formatRadius, describeScope, getShippingEta, badgeForScope };
})();
