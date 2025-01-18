const { Router } = require('express');
const allRoute = Router();
const userRoute = require('./user.route');
const messageRoute = require('./message.route');

allRoute.use('/user', userRoute);
allRoute.use('/message', messageRoute);

module.exports = allRoute;