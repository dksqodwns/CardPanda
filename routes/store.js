const express = require('express');
const router = express.Router();
const {Store, UserStore, UserCard, Card, CardBenefit, Benefit, User,StoreBenefit} = require('../models');
const isLoggedIn = require('../passport/isLoggedIn');

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

router.get('/detail/:storeid', isLoggedIn, async (req, res) => {
    try {
        const storeid = req.params.storeid;
        const userid = req.user.userid;

        const storeBenefits = await StoreBenefit.findAll({
            where: { storeid },
            attributes: ['benefitid']
        });
        const benefitIds = storeBenefits.map(sb => sb.benefitid);

        const cardBenefits = await CardBenefit.findAll({
            where: { benefitid: benefitIds },
            attributes: ['cardid']
        });
        const cardIds = cardBenefits.map(cb => cb.cardid);

        const userCards = await UserCard.findAll({
            where: {
                userid,
                cardid: cardIds
            },
            attributes: ['cardid']
        });
        const userCardIds = userCards.map(uc => uc.cardid);

        const userCardBenefits = await CardBenefit.findAll({
            where: { cardid: userCardIds },
            attributes: ['benefitid']
        });
        const userBenefitIds = userCardBenefits.map(ucb => ucb.benefitid);

        const benefits = await Benefit.findAll({
            where: { benefitid: userBenefitIds },
            attributes: ['benefit_detail']
        });

        const user = await User.findOne({
            where: { userid },
            attributes: ['name']
        });

        const store = await Store.findOne({
            where: { storeid },
            attributes: ['store_name']
        });

        const cards = await Card.findAll({
            where: { cardid: userCardIds },
            attributes: ['card_company', 'card_name', 'card_image']
        });

        const result = {
            user: user.name,
            store_name: store.store_name,
            Card: cards.map(card => ({
                card_company: card.card_company,
                card_name: card.card_name,
                card_image: card.card_image,
                Benefit: benefits.map(b => ({ benefit_detail: b.benefit_detail }))
            }))
        };

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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

router.get('/:category_number', async (req, res) => {
    try {
        const categoryNumber = parseInt(req.params.category_number, 10);

        if (isNaN(categoryNumber)) {
            return res.status(400).json({message: 'Invalid category number'});
        }

        const stores = await Store.findAll({
            where: {
                category_number: categoryNumber
            },
            attributes: ['store_name']
        });

        res.status(200).json(stores);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;