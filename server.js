import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';

// create express app and http server
const app = express();
const server = http.createServer(app);

//middleware setup
app.use(express.json({ limit: '4mb' }));
app.use(cors());

app.use('/api/status', (req, res) => res.send('Server is live'));

//connect to data base 
await connectDB();

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log('Server is running on PORT:' + PORT));
