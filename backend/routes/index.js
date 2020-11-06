const router = require('express').Router();

router
  .get('/', (req, res) => 
    res.status(200).json({ message: 'Api Push Notif' })
  )

  .get('/dbdummy', (req, res) => {
    res.json({ message: 'db' })
  })

  .post('/save-subscription', (req, res) => {
    res.json({ message: 'save-subscription' });
  })

  .get('/send-notification', (req, res) => {
    res.json({ message: 'send-notification' });
  })

module.exports = router;