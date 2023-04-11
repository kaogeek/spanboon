/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenManager } from '../AuthenManager.service';
import { AbstractFacade } from "./AbstractFacade";
import { Today } from "../../models/Today";
import { SearchFilter } from "../../models/SearchFilter";

@Injectable()
export class NewsPaperFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }
    
}
