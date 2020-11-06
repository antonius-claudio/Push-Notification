const fs = require('fs');
const webpush = require('web-push');

class PushNotifController {
  static getSubscription (req, res) {
    // read file subscriber.json
    const data = fs.readFileSync('subscriber.json', 'utf8');
    const result = JSON.parse(data);

    res.json({ subscriber: result });
  }

  static saveSubscription (req, res) {
    // read file subscriber.json
    const data = fs.readFileSync('subscriber.json', 'utf8');
    const result = JSON.parse(data);
    // get new subscriber
    const payload = req.body;
    // add new subscriber
    result.push(payload);
    //write to subscriber.json
    fs.writeFileSync('subscriber.json', JSON.stringify(result), 'utf8');

    res.json({ message: 'success add new subscriber', payload });
  }

  static sendNotification (req, res) {
    const vapidKeys = {
      publicKey: 'BEQ0cl0DbrAbXmFCR3OYVMA_Wp-JP9kQLp6KaKjGDitUVdA7togwMntXLAVEMkAuNKsHGuISGn4Mpykxh32LiOA',
      privateKey: 'tihBkJpvjRmxKi66xRAh5-daqYBoVCoqlQijagTDz0E'
    };

    //function to send the notification to the subscribed device
    const sendNotification = (subscription, payload) => {
      //setting our previously generated VAPID keys
      webpush.setVapidDetails(
        'mailto:myuserid@email.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      );

      webpush.sendNotification(subscription, JSON.stringify(payload)).catch(error => {
        console.error('error send notif', error.stack);
      });
    };

    const data = fs.readFileSync('subscriber.json', 'utf8');
    const subscriber = JSON.parse(data);
    const title = 'new Campaign Marlboro.id';
    const message = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';
    const link = 'https://www.marlboro.id/';
    const icon = 'https://seeklogo.net/wp-content/uploads/2014/10/marlboro-logo.png';
    const props = { title, message, link, icon };

    subscriber.map(item => sendNotification(item, props));
    res.json({ message: 'message sent to all', subscriber });
  }

  static sendNotificationCustom (req, res) {
    const payload = req.body;

    const vapidKeys = {
      publicKey: 'BEQ0cl0DbrAbXmFCR3OYVMA_Wp-JP9kQLp6KaKjGDitUVdA7togwMntXLAVEMkAuNKsHGuISGn4Mpykxh32LiOA',
      privateKey: 'tihBkJpvjRmxKi66xRAh5-daqYBoVCoqlQijagTDz0E'
    };

    //function to send the notification to the subscribed device
    const sendNotification = (subscription, payload) => {
      //setting our previously generated VAPID keys
      webpush.setVapidDetails(
        'mailto:myuserid@email.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      );

      webpush.sendNotification(subscription, JSON.stringify(payload)).catch(error => {
        console.error('error send notif', error.stack);
      });
    };

    const data = fs.readFileSync('subscriber.json', 'utf8');
    const subscriber = JSON.parse(data);

    subscriber.map(item => sendNotification(item, payload));
    res.json({ message: 'message sent to all', subscriber });
  }

  
}

module.exports = PushNotifController;