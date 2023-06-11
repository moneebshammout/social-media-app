
const { migrate } = require('./migration');
const { app } = require('./app');


const { PORT } = process.env;

app.listen(PORT, async () => {
  await migrate();
  console.log(`Server listening on http://localhost:${PORT}`);
});
