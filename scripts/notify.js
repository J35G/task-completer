const Notifier = (() => {
  const stackId = 'toastStack';

  const ensureStack = () => {
    let stack = document.getElementById(stackId);
    if (!stack) {
      stack = document.createElement('div');
      stack.id = stackId;
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  };

  const toast = (message, type = 'info') => {
    const stack = ensureStack();
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    toastEl.innerHTML = `<span>${message}</span>`;
    stack.appendChild(toastEl);

    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(-6px)';
      setTimeout(() => toastEl.remove(), 250);
    }, 3600);
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.warn('Notification permission error', error);
    }
  };

  const push = (title, body) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(title, { body, icon: 'assets/icons/icon-192.png' });
  };

  return { toast, requestPermission, push };
})();
