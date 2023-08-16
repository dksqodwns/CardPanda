const express = require('express');
const router = express.Router();
const {Card, CardBenefit, Benefit, UserCard} = require('../models');
const passport = require("passport");
const isLoggedIn = require('../passport/isLoggedIn')

router.get('/', async (req, res) => {
    try {
        const cards = await Card.findAll({
            attributes: ['cardid', 'card_company', 'card_name', 'card_image']
        });
        res.status(200).json(cards);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});

router.get('/detail/:cardid', async (req, res) => {
    try {
        const cardid = req.params.cardid;
        const card = await Card.findOne({
            where: {
                cardid: cardid
            },
            attributes: ['cardid', 'card_company', 'card_name', 'card_image'],
            include: [
                {
                    model: Benefit,
                    as: 'benefits',
                    attributes: ['store_category', 'benefit_detail'],
                    through: {attributes: []}
                }
            ]
        });
        res.status(200).json(card);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});

router.post('/addcard/:cardid', isLoggedIn, async (req, res) => {
    try {
        const userid = req.user.userid;
        const cardid = req.params.cardid;

        const existingUserCard = await UserCard.findOne({
            where: {
                userid: userid,
                cardid: cardid
            }
        });

        if (existingUserCard) {
            return res.status(409).json({message: 'Card already added'});
        }

        await UserCard.create({
            userid: userid,
            cardid: cardid
        });

        res.status(201).json({message: 'Card added'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;