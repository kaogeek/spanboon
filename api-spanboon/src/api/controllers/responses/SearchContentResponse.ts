/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Posts } from '../../models/Posts';

export class SearchContentResponse {
    public user: any; // displayname, image, id, uniqueid, isAdmin
    public page: any; // name, image, id, pageUsername, isOfficial 
    public post: Posts;
}
