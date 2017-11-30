// modules
import express from 'express';

const router = express.Router();


router.use(function(req, res, next) {
  req.testValue = '안녕하세요.';
  console.log('1번');
  next(); // 다음 middleware 실행
}, function(req, res, next) {
  console.log('2번');
  next(); // 다음 middleware 실행
});