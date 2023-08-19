import express from 'express';
import path from 'path';


const app = express();
const port = 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle the root route with a simple message
app.get('/', (req, res) => {
  res.send('Employee Timeclock');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
