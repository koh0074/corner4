const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const nunjucks = require('nunjucks');
const passport = require('passport');

dotenv.config();
const pageRouter = require('./routes/page');
const { sequelize } = require('./models');
const authRouter = require('./routes/auth');
const passportConfig = require('./passport');
const userRouter = require('./routes/user');

const { User } = require('./models'); // User 모델을 임포트
const { Follow } = require('./models');  // Follow 모델 임포트

const app = express();
app.set('port', process.env.PORT || 3002);

passportConfig(); // 패스포트 설정

// 템플릿 엔진 설정
app.set('view engine', 'html');
nunjucks.configure('views', { 
  express: app,
  watch: true,
});

sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

  //미들웨어 설정
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  name: 'session-cookie',
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);

// 동적 렌더링
const fs = require('fs');

app.get('/:page', (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'views', `${page}.html`);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('Page not found');
    } else {
      res.render(page);  // 해당 페이지를 렌더링
    }
  });
});

// 회원 목록 조회
app.get('/users', (req, res) => {
  User.findAll()
    .then(users => {
      res.render('layout', { 
        title: '회원 목록', 
        users: users,
        user: req.user,
        myId: req.user ? req.user.id : null // 로그인한 사용자의 ID
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("서버 오류");
    });
});


// 팔로우 처리
app.post('/follow', (req, res) => {
  const followerId = req.user.id;  // 현재 로그인한 사용자의 ID
  const followingId = req.body.userId;  // 팔로우하려는 사용자의 ID
  
  // 이미 팔로우 중인지 확인
  Follow.findOrCreate({
    where: { followerId, followingId }
  })
    .then(([follow, created]) => {
      if (created) {
        res.send('팔로우 성공');
      } else {
        res.send('이미 팔로우한 사용자입니다');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("서버 오류");
    });
});



app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
