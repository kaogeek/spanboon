/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import * as express from 'express';
import morgan from 'morgan';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

import { env } from '../../env';
import { Logger } from '../../lib/logger';

@Middleware({ type: 'before' })
export class LogMiddleware implements ExpressMiddlewareInterface {

    private log = new Logger(__dirname);

    public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
        return morgan(env.log.output, {
            stream: {
                write: this.log.info.bind(this.log),
            },
        })(req, res, next);
    }

}
