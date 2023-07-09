const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
//const xss = require('xss');
const helmet = require('helmet');
const hpp = require('hpp');
const AppError = require(__dirname + '/utils/appError');
const globalErrorHandler = require(__dirname + '/controller/errorController');
const tourRouter = require(__dirname + '/routes/tourRoutes');
const userRouter = require(__dirname + '/routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
//app.use(morgan('start'));


const limit = rateLimit(
    {
        max: 100,
        windowMs: 60 * 60 * 1000,
        message: 'Too many requests from this IP, please try again in an hour!'

    }
);


app.use(helmet());

app.use('/api', limit);




app.use(express.json({ limit: '20kb' }));
app.use(express.static(`${__dirname}/public`));

// no SQL injection
app.use(mongoSanitize());

// no XSS
//app.use(xss());

// prevent parameter pollution

app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage',
    'maxGroupSize','difficulty', 'price']
}));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;