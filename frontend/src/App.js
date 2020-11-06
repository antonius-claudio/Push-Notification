import logo from './logo.svg';
import './App.css';

function App() {

  // urlB64ToUint8Array is a magic function that will encode the base64 public key
  // to Array buffer which is needed by the subscription option
  const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // saveSubscription saves the subscription to the backend
  const saveSubscription = async subscription => {
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

  const checkNotif = () => {
    console.log('masuk check notif home')
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
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
          const applicationServerKey = urlB64ToUint8Array(vapid);
          const options = { applicationServerKey, userVisibleOnly: true };
          const subscription = await worker.pushManager.subscribe(options);
          console.log('data this to be for subcr', JSON.stringify(subscription))
          const saveSub = await saveSubscription(subscription);
          console.log('result from be', saveSub)
        })
        .catch((err) => {
          console.log('error loh', err)
        });
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={checkNotif}>Notify Me</button>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
