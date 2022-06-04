var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');

var app = express();

require('./connection/index');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/api', usersRouter);
app.use('/api', postsRouter);
app.use((req, res, next) => {
  res.status(404).send({
    status: "error",
    message: "找不到該路由"
  })
});

const resProductionErr = (err, res) => {
  if(!err.isOpreational) {
    console.error('出現重大錯誤', err);
    err.statusCode = 500;
    err.message = "發生錯誤，請聯絡管理員";
  }
  res.status(err.statusCose).send({
    status: "error",
    message: err.message
  });
}
const resDevelopeErr = (err, res) => {
  res.status(err.statusCode).send({
    status: "error",
    message: err.message,
    error: err,
    stack: err.stack
  })
}

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  process.env.NODE_ENV === develop ? resDevelopeErr(err, res) : resProductionErr(err, res);
})

process.on('unhandledRejection', (err, promise) => {
  console.error('Uncaughted Rejection');
  console.error('rejection：', promise, '原因：', err);
});
process.on('uncaughtException', err => {
  console.error('Uncaughted Exception！');
  console.error(err);
  process.exit(1);
});

module.exports = app;
