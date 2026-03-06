self.addEventListener('push', function (event) {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body,
    // --- CORREÇÃO AQUI: Use o nome exato do seu arquivo ---
    icon: '/FLAVICON-COM-RETANGULO-physio-track.png', 
    badge: '/FLAVICON-COM-RETANGULO-physio-track.png', // O ícone pequeno da barra
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});