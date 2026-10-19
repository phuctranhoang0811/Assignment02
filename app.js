require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Đọc JSON từ Postman.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const path = require('path');
const createError = require('http-errors');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const questionRoutes = require('./routes/question');
// Đăng ký API trước route trang chủ và trước 404.
app.use('/api/questions', questionRoutes);
app.use('/questions', questionRoutes.pageRouter);
app.use('/', require('./routes/index'));
// Hàm này được bin/www gọi trước khi mở port 3000.
app.locals.connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });

  console.log('MongoDB connected successfully');
};

// URL không tồn tại.
app.use(function (req, res, next) {
  next(createError(404));
});


module.exports = app;