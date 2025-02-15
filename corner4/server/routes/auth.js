const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, login, logout } = require('../controllers/auth');

const router = express.Router();

// POST /auth/join - 회원가입 처리
router.post('/join', isNotLoggedIn, join);

// POST /auth/login - 로그인 처리
router.post('/login', isNotLoggedIn, passport.authenticate('local', {
  failureRedirect: '/auth/login',  // 로그인 실패 시 다시 로그인 페이지로 리다이렉트
  failureFlash: true,
}), (req, res) => {
  // 로그인 성공 시 /profile 페이지로 리다이렉트
  res.redirect('/user/list');
});

// GET /auth/logout - 로그아웃 처리
router.get('/logout', isLoggedIn, logout);

module.exports = router;
