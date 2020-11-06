console.log('Hello from service worker');

let linkNotif = 'www.test.com';

const showLocalNotification = (data, swRegistration) => {
  // const message = JSON.parse(data);
  const { title, message, link, icon } = data;
  console.log('swRegistration showNotif', data)
  linkNotif = link;
  const options = {
    body: message,
    icon: icon,
    // here you can add more properties like icon, image, vibrate, etc.
  };
  swRegistration.showNotification(title, options);
};

self.addEventListener('push', function(event) {
  if (event.data) {
    showLocalNotification(event.data.json(), self.registration);
  } else {
    console.log('Push event but no data');
  }
});

self.addEventListener('notificationclick', function(event) {
  // Android doesn't close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url == linkNotif && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow(linkNotif);
      }
    })
  );
}); 