const express = require('express');
const app = express()
var cookieParser = require("cookie-parser");
var cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require('./config/mongoDB');
const swaggerDocs = require('./config/swagger');
const authRoutes = require('./routes/authRoute');
const userProfileRoutes = require('./routes/userProfileRoute');
const categoryRoutes = require('./routes/categoryRoute');
const courseRoutes = require('./routes/courseRoute');

const port = process.env.PORT || 3000;

connectDB.connect();  // Connect to MongoDB

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
swaggerDocs(app); // Initialize Swagger documentation

app.use('/api/auth', authRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);



app.get('/',(req, res) => {
    res.send('API is running...')
})


app.listen(port , () =>{
    console.log(`App listening on port ${port}`);
})