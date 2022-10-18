/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Application } from 'express';
import express from 'express';
import spdy from 'spdy';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { useExpressServer } from 'routing-controllers';
import { authorizationChecker } from '../auth/authorizationChecker';
import { currentUserChecker } from '../auth/currentUserChecker';
import {env}  from '../env';
import cors from 'cors';
import compression from 'compression';
import { Server } from 'socket.io';

export const expressLoader: MicroframeworkLoader = async(settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        const connection = settings.getData('connection');
        /**
         * We create a new express server instance.
         * We could have also use useExpressServer here to attach controllers to an existing express instance.
         */
        const app = express();
        app.use(cors());
        app.use(compression());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json({ limit: '50mb' }));
        const server = app.listen(env.app.port);
        const io = new Server(server, {
            cors:{
                origin: process.env.weblocalhost,
                credentials:true,
            }
        });
        // store all of our online users inside this map 
        io.on('connection', (socket) => {
            console.log('a user connected' +socket.id);
            global.chatSocket = socket; // store the chat socket inside the global chat
            socket.on('disconnect',()=>{
                console.log('user disconnected' +socket.id);
            });
            socket.on('add-user',(userId) =>{
                global.onlineUsers.set(userId,socket.id);
            });
            socket.on('send-msg',(data)=>{
                console.log(data);
                const sendUserSocket = global.onlineUsers.get(data.to);
                if(sendUserSocket){
                    socket.to(sendUserSocket).emit('msg-receive',data.message);
                }
            });
          });

        const expressApp: Application = useExpressServer(app, {
            cors: true,
            classTransformer: true,
            routePrefix: env.app.routePrefix,
            defaultErrorHandler: false,
            /**
             * We can add options about how routing-controllers should configure itself.
             * Here we specify what controllers should be registered in our express server.
             */
            controllers: env.app.dirs.controllers,
            middlewares: env.app.dirs.middlewares,
            interceptors: env.app.dirs.interceptors,

            /**
             * Authorization features
             */
            authorizationChecker: authorizationChecker(connection),
            currentUserChecker: currentUserChecker(connection),
        });

        if (!env.isProduction) {
            /* Create Https */
            const privateKey = fs.readFileSync('sslcert/spanboon.key', 'utf8');
            const certificate = fs.readFileSync('sslcert/spanboon.crt', 'utf8');
            const credentials = { key: privateKey, cert: certificate };
            spdy.createServer(credentials, expressApp).listen(env.app.sslport);
            /* end Https */
        }

        // // parse application/x-www-form-urlencoded
        // expressApp.use(bodyParser.urlencoded({extended: true}));
        // expressApp.use(bodyParser.json({limit: '50mb'}));

        // Run application to listen on given port
        if (!env.isTest) {
            settings.setData('express_server', app);
        }
        // Here we can set the data for other loaders
        settings.setData('express_app', expressApp);
    }
};
