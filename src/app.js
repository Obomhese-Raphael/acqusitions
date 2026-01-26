import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Acquisitions Service');
});

export default app;
