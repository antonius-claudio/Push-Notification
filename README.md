# Push Notification
---

#### Note
> Mozilla Dekstop : Notif keluar hanya ketika Browser terbuka
> Chrome Dekstop, Mozilla dan Chrome Mobile : Notif keluar walaupun ditutup.

## Demo 

Server BE : https://nameless-dusk-24904.herokuapp.com/
## GET /dbdummy
> get subscribers

## POST /save-subscription
> save new subscriber to db

**Request Body**
- ***chrome***
```
{
    "endpoint":"",
    "expirationTime":null,
    "keys":{
        "p256dh":"",
        "auth":""
    }
}
```
- ***firefox***
```
{
    "endpoint":"",
    "keys":{
        "auth":"",
        "p256dh":""
    }
}
```

**Response**
```
{ 
    message: 'success add new subscriber', 
    payload: {}
}
```

## GET /send-notification
> send static message to subscribers

## POST /send-notification-custom
> send dinamyc message to subscribers

**Request Body**
```
{
    "title":"",
    "message":"",
    "link":"",
    "icon":"",
}
```
## FRONT END
---
### Step 1 : Register
- Panggill default function register service worker dari react (registerServiceWorker.js) di index.js
```
import * as ServiceWorker from "./registerServiceWorker";
ServiceWorker.register();
```
### Step 2 : Buat File Service Worker
- Buat File serviceworker.js di dalam folder public
- Tambahkan direktori dari serviceworker di dalam function register pada registerServiceWorker.js
```
const swUrl = `${process.env.PUBLIC_URL}/selfpush-sw.js`;
```
- Tambahkan custom url, agar dapat di akses ketika sudah dideploy pada server.js
```
app.get("/selfpush-sw.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "selfpush-sw.js"));
});
```

### Step 3 : Request Permission Notification
- Cek notification permission
```
checkNotif = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    else if (Notification.permission === "granted") {
      console.log('granted permission');
    }
    else if (Notification.permission !== "denied") {
      console.log('denied permission');
    }
  }
```
- Tambahkan request permission ketika tidak sama dengan “denied” dan granted
```
checkNotif = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    else if (Notification.permission === "granted") {
      console.log('granted permission');
    }
    else if (Notification.permission !== "denied") {
      Notification.requestPermission()
        .then((permission) => {
          if  (permission === "granted") {
            // subscribe ke Back End
          }
        })
        .catch((err) => {
          console.log('error loh', err)
        });
    }
  }
```
- Tambah function untuk mengubah base 64 menjadi 8 array
```
urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };
```
- Tambah function untuk mengirim subscription ke Back End
```
saveSubscription = async subscription => {
    const SERVER_URL = 'https://nameless-dusk-24904.herokuapp.com/save-subscription'
    const response = await fetch(SERVER_URL, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })
    const result = await response.json();
    return result;
  };
```
- Lalu panggil ketika permission granted, untuk mendaftarkan ke Back End.
Vapid key didapat dari public key yang sama dengan Back End.
```
checkNotif = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    else if (Notification.permission === "granted") {
      console.log('granted permission');
    }
    else if (Notification.permission !== "denied") {
      Notification.requestPermission()
        .then((permission) => {
          if  (permission === "granted") {
            return navigator.serviceWorker.ready;
          }
        })
        .then(async (worker) => {
          const vapid = "BEQ0cl0DbrAbXmFCR3OYVMA_Wp-JP9kQLp6KaKjGDitUVdA7togwMntXLAVEMkAuNKsHGuISGn4Mpykxh32LiOA";
          const applicationServerKey = this.urlB64ToUint8Array(vapid);
          const options = { applicationServerKey, userVisibleOnly: true };
          const subscription = await worker.pushManager.subscribe(options);
          const saveSub = await this.saveSubscription(subscription);
        })
        .catch((err) => {
          console.log('error loh', err)
        });
    }
  }
```

### Step 4 : Menangkap Push Event
- Pada serviceworker.js tambahkan function untuk menangkap push notification event dari Back End
```
self.addEventListener('push', function(event) {
  if (event.data) {
    console.log('after exist push event', event.data.text())
    // function untuk menampilkan notification
  } else {
    console.log('Push event but no data');
  }
});
```
- Tambahkan function untuk menampilkan Notification, linkNotif digunakan untuk menyimpan url untuk dipakai ketika event notificationClick
```
let linkNotif = 'https://www.marlboro.id/';
const showLocalNotification = (data, swRegistration) => {
  const { title, message, icon, link } = data;
  console.log('swRegistration showNotif', data)
  linkNotif = link;
  const options = {
    body: message,
    icon: icon,
    // here you can add more properties like icon, image, vibrate, etc.
  };
  swRegistration.showNotification(title, options);
};
```
- Hasil akhirnya akan seperti ini
```
self.addEventListener('push', function(event) {
  if (event.data) {
    console.log('after exist push event', event.data.text())
    showLocalNotification(event.data.json(), self.registration);
  } else {
    console.log('Push event but no data');
  }
});
```

### Step 5 : Menangkap Notification Click Event
- Pada serviceworker.js tambahkan function untuk menangkap notification click event yang akan membuka link yang dikirim dari Back End ketika mendapat push event.
```
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
clients.openWindow(linkNotif)
  );
}); 
```

### Step 6 : Mengaktifkan New Service Worker (update sw)
- Pada serviceworker.js tambahkan function untuk mengaktifkan service worker yang baru apabila terjadi perubahan.
```
self.addEventListener('install', event => {
  self.skipWaiting();
});
```

## BACK END
---
### Step 1 : Install Web Push
```
npm install web-push --save
```

### Step 2 : Tambahkan Endpoint
- 1. Untuk menyimpan subscription
```
app.post('/save-subscription', (req, res) => {
});
```
- 2. Untuk mengirim notification
```
app.get('/send-notification', (req, res) => {
});
```

### Step 3 : Menyimpan Subscription
- Endpoint untuk user subscribe notification, sekarang hanya disimpan dalam variable (dummy db)
```
const dummyDb = { subscription: null };
const saveToDatabase = async subscription => {
  dummyDb.subscription = subscription;
};
```
- Panggil method / controllers / services untuk menyimpan ke database
```
app.post('/save-subscription', async (req, res) => {
  const subscription = req.body;
  await saveToDatabase(subscription);
  res.json({ message: 'success' });
});
```

### Step 4 : Mengirim Notification
- Endpoint untuk admin mengirim notification kepada user yang sudah mensubcribe. Karena hanya dummy, maka hanya mengirimkan kepada 1 subscriber.
- Public Key dan Private Key didapat dengan menggunakan
```
web-push generate-vapid-keys
```
- dan mendapatkan sebagai berikut
```
=======================================

Public Key:
BOtXu6b3btJKaHAZZ5e1j-6r_2XuU7PN1aeJdKIlueNRy2Ir0jX9qKmcXf9SlqYtH-PN7IMw7kUSIWG_ZnYGEcQ

Private Key:
ZpnVfykavnanbkHCm-Jr03_n8gyvw5GSAD2XWmYAnT8

=======================================
```
- Lalu siapkan method / controller / service untuk mengirim notification
```
const webpush = require('web-push');
 
const sendNotification = (subscription, payload) => {
  const vapidKeys = {
    publicKey: 'BEQ0cl0DbrAbXmFCR3OYVMA_Wp-JP9kQLp6KaKjGDitUVdA7togwMntXLAVEMkAuNKsHGuISGn4Mpykxh32LiOA',
    privateKey: 'tihBkJpvjRmxKi66xRAh5-daqYBoVCoqlQijagTDz0E'
  };
  
  webpush.setVapidDetails(
    'mailto:myuserid@email.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
 
  webpush.sendNotification(subscription, JSON.stringify(payload)).catch(error => {
    console.error('error send notif', error.stack);
  });
};
```
- Setelah itu panggil pada routing yang telah disediakan. (title, mesage, link masih static)
```
app.get('/send-notification', (req, res) => {
  const subscription = dummyDb.subscription;
  const title = "title loh";
  const message = 'Hello World';
  const link = "https://www.marlboro.id/";
  const icon = "https://seeklogo.net/wp-content/uploads/2014/10/marlboro-logo.png";
 
  const props = { title, message, link };
  sendNotification(subscription, props);
  res.json({ message: 'message sent' });
});
```