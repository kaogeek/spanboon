/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { configure, format, transports } from 'winston';

import { env } from '../env';

export const winstonLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    configure({
        transports: [
            new transports.Console({
                level: env.log.level,
                handleExceptions: true,
                format: env.node !== 'development'
                    ? format.combine(
                        format.json()
                    )
                    : format.combine(
                        format.colorize(),
                        format.simple()
                    ),
            }),
        ],
    });
};
