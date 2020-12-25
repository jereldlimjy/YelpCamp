const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const AppError = require('./utils/AppError');
const wrapAsync = require('./utils/wrapAsync');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!');
});

const app = express();

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true}));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

app.get('/', (req, res) => {
    res.render('campgrounds/home');
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

// order matters here!
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, wrapAsync(async (req, res, next) => {
    const { title, image, price, description, location } = req.body;
    const campground = new Campground({ title, image, price, description, location });
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
})) 

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/campgrounds/${id}`);
}))

app.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.use((err, req, res, next) => {
    console.dir(err);
    res.render('error', { err });
})

app.listen(3000);