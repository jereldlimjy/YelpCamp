const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const wrapAsync = require('../utils/wrapAsync');
const AppError = require('../utils/AppError');
const Joi = require('joi');

const validateCampground = (req, res, next) => {
    const campgroundSchema = Joi.object({
        title: Joi.string().required(),
        price: Joi.number().min(0),
        description: Joi.string().required(),
        location: Joi.string().required(),
        image: Joi.string().required()
    });
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        throw new AppError(400, error);
    } else {
        next();
    }
}

router.get('/', (req, res) => {
    res.render('campgrounds/home');
})

router.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

// order matters here!
router.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/campgrounds', validateCampground, wrapAsync(async (req, res, next) => {
    const { title, image, price, description, location } = req.body;
    const campground = new Campground({ title, image, price, description, location });
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/campgrounds/:id', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
})) 

router.get('/campgrounds/:id/edit', wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

router.put('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/campgrounds/${id}`);
}))

router.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;