import express from 'express';
import cors from 'cors';
import { route } from "./routes/index";


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use(route);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
