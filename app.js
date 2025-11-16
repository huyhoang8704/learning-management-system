const express = require('express');
const app = express()
var cookieParser = require("cookie-parser");
var cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require('./config/mongoDB');
const swaggerDocs = require('./config/swagger');

// Auth Services
const authRoutes = require('./routes/authRoute');
const userProfileRoutes = require('./routes/userProfileRoute');

// Course Services
const categoryRoutes = require('./routes/categoryRoute');
const courseRoutes = require('./routes/courseRoute');
const enrollmentRoutes = require('./routes/enrollmentRoute');
const lessonRoutes = require('./routes/lessonRoute');
const lessonContentRoutes = require('./routes/lessonContentRoute');

// Quiz Services
const questionBankRoutes = require('./routes/questionBankRoute');
const questionRoutes = require('./routes/questionRoute');

const port = process.env.PORT || 3000;

connectDB.connect();  // Connect to MongoDB

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
swaggerDocs(app); // Initialize Swagger documentation

// Auth Services
app.use('/api/auth', authRoutes);
app.use('/api/profile', userProfileRoutes);

// Course Services
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/lesson-contents', lessonContentRoutes);

// Quiz Services
app.use('/api/question-banks', questionBankRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quizzes', require('./routes/quizRoute'));



app.get('/',(req, res) => {
    res.send('API is running...')
})


app.listen(port , () =>{
    console.log(`App listening on port ${port}`);
})