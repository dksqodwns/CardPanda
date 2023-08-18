const express = require('express');
const router = express.Router();
const {Store, UserStore, UserCard, Card, CardBenefit, Benefit, User,StoreBenefit} = require('../models');
const isLoggedIn = require('../passport/isLoggedIn');

// 매장 리스트 조회
router.get('/', async (req, res) => {
    try {
        const stores = await Store.findAll({
            attributes: ['store_name', 'store_category']
        });
        res.status(200).json(stores);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});

// 매장 상세정보 조회
router.get('/detail/:storeid', isLoggedIn, async (req, res) => {
    try {
        const storeid = req.params.storeid;
        const userid = req.user.userid;

        const userCards = await UserCard.findAll({
            where: {
                userid: userid
            },
            attributes: ['cardid']
        });

        const userCardIds = userCards.map(uc => uc.cardid);

        const storeWithBenefits = await Store.findOne({
            where: {
                storeid: storeid
            },
            include: [{
                model: Benefit,
                through: { model: StoreBenefit },
                include: [{
                    model: Card,
                    where: {
                        cardid: userCardIds
                    },
                    through: { attributes: [] },
                    attributes: ['card_name', 'card_image', 'card_company']
                }],
                attributes: ['benefit_detail']
            }],
            attributes: ['store_name']
        });

        const formattedData = {
            store_name: storeWithBenefits.store_name,
            Benefit: storeWithBenefits.Benefit && storeWithBenefits.Benefit.length ? storeWithBenefits.Benefit.map(benefit => {
                if (benefit.Card && benefit.Card.length) {
                    return {
                        card_name: benefit.Card[0].card_name,
                        card_image: benefit.Card[0].card_image,
                        card_company: benefit.Card[0].card_company,
                        benefit_detail: benefit.benefit_detail
                    };
                } else {
                    return null;
                }
            }).filter(item => item !== null) : []
        };


        res.status(200).json(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});


router.post('/addstore/:storeid', isLoggedIn, async (req, res) => {
    try {
        const userid = req.user.userid;
        const storeid = req.params.storeid;

        const existingUserStore = await UserStore.findOne({
            where: {
                userid: userid,
                storeid: storeid
            }
        });

        if (existingUserStore) {
            return res.status(409).json({message: 'Store already added'});
        }

        await UserStore.create({
            userid: userid,
            storeid: storeid
        });

        res.status(201).json({message: 'Store added'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;