// const express = require('express');

// const router = express.Router();

// // GET /user 라우터
// router.get('/', (req, res) => {
//   res.send('Hello, User');
// });

// module.exports = router;


const express = require('express');

const { isLoggedIn } = require('../middlewares');
const { follow } = require('../controllers/user');
const { User } = require('../models');

const router = express.Router();

// 모든 사용자 목록 조회 + 팔로우 기능(로그인한 경우에만 접근 가능)

// router.post('/:id/follow', isLoggedIn, follow);

// router.get('/list', isLoggedIn, async (req, res, next) => {
//   try {
//     const users = await User.findAll();  // User 테이블에서 모든 사용자 조회
//     res.render('layout', {  // layout.html 템플릿에 users 배열 전달
//       title: '회원 목록',  // 페이지 타이틀
//       users: users,      // 조회한 사용자 목록
//       user: req.user      // 로그인한 사용자 정보
//     });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const me = await User.findByPk(req.user.id);
    const targetUser = await User.findByPk(id);

    if (!targetUser) {
      return res.status(404).json({ message: '해당 사용자를 찾을 수 없습니다.' });
    }

    if (me.id === targetUser.id) {
      return res.status(400).json({ message: '자기 자신을 팔로우할 수 없습니다.' });
    }

    const isFollowing = await me.hasFollowing(targetUser);
    if (isFollowing) {
      return res.status(400).json({ message: '이미 팔로우한 북루미입니다!' });
    }

    await me.addFollowing(targetUser);
    return res.json({ message: '팔로우 성공!' });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 모든 사용자 목록 조회 (로그인한 경우에만 접근 가능)
router.get('/list', isLoggedIn, async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.render('layout', {
      title: '회원 목록',
      users,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


//닉네임 변경 api
router.post('/nickname', isLoggedIn, async (req, res, next) => {
  try {
    const { newNick } = req.body;
    
    if (!newNick) {
      return res.status(400).json({ message: '닉네임을 입력하세요.' });
    }

    const existingUser = await User.findOne({ where: { nick: newNick } });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 닉네임입니다.' });
    }

    await User.update({ nick: newNick }, { where: { id: req.user.id } });

    res.json({ message: '닉네임이 변경되었습니다!' });
  } catch (error) {
    console.error(error);
    next(error);
  }
});




module.exports = router;
