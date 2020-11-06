const PushNotifController = require('../controllers/PushNotifController');

const router = require('express').Router();

router
  .get('/', (req, res) => 
    res.status(200).json({ message: 'Api Push Notif' })
  )

  .get('/dbdummy', PushNotifController.getSubscription)

  .post('/save-subscription', PushNotifController.saveSubscription)

  .get('/send-notification', PushNotifController.sendNotification)

  .post('/send-notification-custom', PushNotifController.sendNotificationCustom)

module.exports = router;