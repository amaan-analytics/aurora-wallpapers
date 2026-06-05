// Service Worker registration script for Aurora Wallpapers PWA

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Aurora SW: Registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Aurora SW: Registration failed:', error);
      });
  });
}

// Track installation prompt event
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent default auto-prompt
  e.preventDefault();
  
  // Save event
  deferredPrompt = e;
  
  // Notify components that app is installable
  const installableEvent = new CustomEvent('aurora-pwa-installable');
  window.dispatchEvent(installableEvent);
  
  console.log('Aurora PWA: Install banner is ready for display.');
});

// Global PWA installer trigger
window.installAuroraPWA = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Aurora PWA: User accepted installation.');
      } else {
        console.log('Aurora PWA: User declined installation.');
      }
      deferredPrompt = null;
    });
  } else {
    console.warn('Aurora PWA: Install prompt is unavailable (already installed or platform unsupported).');
  }
};
