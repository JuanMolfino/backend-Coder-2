import express from 'express';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import sessionsRouter from './routes/sessionsRouter.js';
import usersRouter from './routes/userRouter.js';
import passport from 'passport';
import { configPassport } from './config/passport.config.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';

const app = express();

mongoose.connect(env.mongoUri);

//Handlebars Config
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    layoutsDir: __dirname + '/../views/layouts'
}));
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

// Passport
configPassport();
app.use(passport.initialize());

//Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/', viewsRouter);

const httpServer = app.listen(env.port, () => {
    console.log(`Start server in PORT ${env.port}`);
});

const io = new Server(httpServer);

websocket(io);