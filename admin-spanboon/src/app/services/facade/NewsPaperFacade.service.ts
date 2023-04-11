/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NewsPaper } from "../../models/NewsPaper";
import { SearchFilter } from "../../models/SearchFilter";
import { AuthenManager } from "../AuthenManager.service";
import { AbstractFacade } from "./AbstractFacade";

@Injectable()
export class NewsPaperFacade extends AbstractFacade {

    constructor(http: HttpClient, authMgr: AuthenManager) {
        super(http, authMgr);
    }

    public search(searchFilter: SearchFilter): Promise<NewsPaper[]> {
        return new Promise((resolve, reject) => {
            let url: string = this.baseURL + '/admin/page/snapshot';

            let options = this.getDefaultOptions();
            this.http.get(url, options).toPromise().then((response: any) => {
                for (let r of response.data) {
                    if (r.coverPageURL != null && r.coverPageURL != undefined) {
                        this.getPathFile(r.coverPageURL).then((res: any) => {
                            r.image = res.data
                        }).catch((err: any) => {
                        });
                    }
                }
                resolve(response.data as NewsPaper[]);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}
