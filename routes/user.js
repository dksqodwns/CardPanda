const express = require('express');
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {User, UserCard, UserStore, sequelize, Card, Store} = require('../models');
const isLoggedIn = require('../passport/isLoggedIn')
const LocalStrategy = require('passport-local').Strategy;

const passportJWT = require("passport-jwt"),
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

const jwtOpts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET_KEY
};

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({where: {email: email}});
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, {message: 'Incorrect password.'});
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.use(new JWTStrategy(jwtOpts, function (jwt_payload, done) {
    return User.findOne({where: {email: jwt_payload.email}})
        .then(user => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => {
            return done(err, false);
        });
}));


router.get("/join", (req, res) => {
    res.sendStatus(200);
})

router.get("/login", (req, res) => {
    res.sendStatus(200);
})

router.get('/mypage', isLoggedIn, async (req, res) => {
    try {
        const userid = req.user.userid;

        const user = await User.findOne({
            where: {
                uesrid: userid
            }
        });
        const userName = user.name;

        const cards = await UserCard.findAll({
            where: {
                userid: userid
            }
        });
        const stores = await UserStore.findAll({
            where: {
                userid: userid
            }
        });

        res.status(200).json({ name: userName, data: cards.concat(stores) });
    } catch (err) {
        res.status(500).json({message: 'Server error' + err.message});
    }
});

router.get('/mypage/mystore', isLoggedIn, async (req, res) => {
    try {
        const userid = req.user.userid;

        const stores = await UserStore.findAll({
            where: {
                userid: userid
            },
            include:[{
                model: Store,
                attributes:["store_name", "store_category"]
            }]
        });
        const storeData = stores.map(store =>{
            return {
                storeid: store.storeid,
                userid: store.userid,
                store_name: store.Store.store_name,
                store_category: store.Store.store_category,
            }
        })

        res.status(200).json(storeData);
    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
});

router.get('/mypage/mycard', isLoggedIn, async (req, res) => {
    try {
        const userid = req.user.userid;

        const cards = await UserCard.findAll({
            where: {
                userid: userid
            },
            include:[{
                model: Card,
                attributes: ["card_name","card_image"]
            }]
        });

        const cardData = cards.map(card =>{
            return {
                cardid: card.cardid,
                userid: card.userid,
                card_name: card.Card.card_name,
                card_image: card.Card.card_image
            }
        })

        res.status(200).json(cardData);
    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
});

router.post("/join", async (req, res) => {
    const {name, email, password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await User.findOne({
            where: {email: email}
        });
        if (!name || !email || !password) {
            return res.sendStatus(400);
        }
        if (existingUser) {
            return res.sendStatus(409);
        }
        await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

router.post('/login', async (req, res, next) => {
    passport.authenticate("local", {session: false}, (err, user, info) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (info) {
            return res.status(401).send(info.reason);
        }
        return req.login(user, {session: false}, async (loginErr) => {
            if (loginErr) {
                console.error(loginErr);
                return next(loginErr);
            }
            const fullUserWithoutPwd = await User.findOne({
                where: {email: user.email},
                attributes: {
                    exclude: ["password"],
                },
            });
            const accessToken = jwt.sign({
                    email: user.email,
                    name: user.name,
                },
                process.env.JWT_SECRET_KEY, {
                    expiresIn: "1h",
                    issuer: "weather",
                    subject: "user_info"
                });
            const refreshToken = jwt.sign({}, process.env.JWT_SECRET_KEY, {
                expiresIn: "1d",
                issuer: "weather",
                subject: "user_info",
            });
            fullUserWithoutPwd.token = refreshToken;

            await fullUserWithoutPwd.save();

            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
            });

            return res.status(200).json({
                success: true,
                accessToken,
            });
        });
    })(req, res, next);
})

router.delete('/mypage/deletestore/:storeid', isLoggedIn, async (req, res) => {
    try {
        const userid = req.user.userid;
        const storeid = req.params.storeid;

        const existingStore = await UserStore.findOne({
            where: {
                userid: userid,
                storeid: storeid
            }
        });

        if (!existingStore) {
            return res.status(404).json({message: '해당 매장을 찾을수가 없어요'});
        }

        await UserStore.destroy({
            where: {
                userid: userid,
                storeid: storeid
            }
        });

        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({message: '[서버에러] 관리자에게 문의'});
    }
});

router.delete('/mypage/deletecard/:cardid', isLoggedIn, async (req, res) => {
    try {
        const userid = req.user.userid;
        const cardid = req.params.cardid;

        const existingCard = await UserCard.findOne({
            where: {
                userid: userid,
                cardid: cardid
            }
        });

        if (!existingCard) {
            return res.status(404).json({message: '카드를 찾을수 없어요'});
        }

        await UserCard.destroy({
            where: {
                userid: userid,
                cardid: cardid
            }
        });

        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({message: '[서버에러] 관리자에게 문의'});
    }
});


module.exports = router;