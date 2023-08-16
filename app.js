const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {sequelize} = require('./models');
const {User} = require('./models');
const passport = require('passport');
const {Strategy: LocalStrategy} = require('passport-local');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger-output.json')


dotenv.config();

const userRouter = require('./routes/user');
const cardRouter = require('./routes/card');
const storeRouter = require('./routes/store');

sequelize.sync({force: false})
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, { explorer: true }));

app.use(cors({
    origin: true, // 접근 권한을 부여하는 도메인
    credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
}));

app.use('/', userRouter);
app.use('/cardlist', cardRouter);
app.use('/store', storeRouter);

const port = process.env.PORT || 8080;

app.listen(port, async () => {
    console.log(`Listening on ${port}`);
});


module.exports = app;
