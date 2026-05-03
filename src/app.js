import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';

const app = express(); //create an instance of express application
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json()); //middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); //middleware to parse urlencoded request bodies
app.use(cookieParser()); //middleware to parse cookies

// routes declaration
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

//example route : http://localhost:4000/api/users/register
//example route : http://localhost:4000/api/users/login
//example route : http://localhost:4000/api/posts/create

export default app;
