/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { env } from '../env';
import * as schedule from 'node-schedule';
import axios from 'axios';

/* 
* This will set job schedule for Clear Temp File
*/
export const jobSchedulerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    // Run Every Hour
    // Clear Temp File
    schedule.scheduleJob('*/5 * * * *', () => {
        axios.delete(`http://${env.app.host}:${env.app.port}${env.app.routePrefix}/file/temp`).then((res) =>{
            console.log(`Clear Temp File : ${res.status}`);
        }).catch((err) =>{
            console.log('err: ' + err);
        });
    });

    // Run Every 3 Hour
    // update page token
    schedule.scheduleJob('0 */3 * * *', () => {
        axios.post(`http://${env.app.host}:${env.app.port}${env.app.routePrefix}/jobs/extended_token`).then((res) =>{
            console.log(`update page token : ${res.status}`);
        }).catch((err) =>{
            console.log('err: ' + err);
        });
    });
    
    // fetch feed twitter
    schedule.scheduleJob('*/1 * * * *', () =>{
        axios.get(`http://${env.app.host}:${env.app.port}${env.app.routePrefix}/twitter/feed_tw`).then((res)=>{
            console.log(`Fetch Twitter : ${res.status}`);
        }).catch((err)=>{
            console.log('err: ' + err);
        });
    });
};
