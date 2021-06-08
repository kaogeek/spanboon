/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DialogReboonTopic } from '../components/shares/dialog/DialogReboonTopic.component';
import { RePost } from '../models/RePost';
import { SearchFilter } from '../models/SearchFilter';
import { AuthenManager } from './AuthenManager.service';
import { AbstractFacade } from './facade/AbstractFacade';
import { AssetFacade } from './facade/AssetFacade.service';
import { PageFacade } from './facade/PageFacade.service';
import { PostFacade } from './facade/PostFacade.service';
// import { AbstractFacade, AssetFacade, AuthenManager, PageFacade, PostFacade } from './services';

@Injectable({
    providedIn: 'root'
})

export class PostActionService extends AbstractFacade {

    private pageFacade: PageFacade;
    private assetFacade: AssetFacade;
    private postFacade: PostFacade;
    public dialog: MatDialog;

    public userAsPage: any;
    public dataPost: any;
    public data: RePost = new RePost();
    public pageInUser: any[];

    constructor(http: HttpClient, authMgr: AuthenManager, pageFacade: PageFacade, assetFacade: AssetFacade, postFacade: PostFacade, dialog: MatDialog) {
        super(http, authMgr);
        this.pageFacade = pageFacade;
        this.assetFacade = assetFacade;
        this.postFacade = postFacade;
        this.dialog = dialog;
    }

    public async actionPost(action: any, index: number, resPost: any, repostShare?: string) {
        console.log('action ==== > ', action);
        console.log('resPost ==== > ', resPost);
        console.log('repostShare ==== > ', repostShare);
        console.log('index ==== > ', index);
        if (action.mod === 'REBOON') {
            if (action.userAsPage.id !== undefined && action.userAsPage.id !== null && action.userAsPage.id !== this.authMgr.getCurrentUser().id) {
                this.userAsPage = action.userAsPage.id;
            } else {
                this.userAsPage = null;
            }
            if (this.userAsPage !== null && this.userAsPage !== undefined && this.userAsPage !== '') {
                this.data.postAsPage = this.userAsPage;
                this.data.pageId = this.userAsPage;
            } else {
                this.data.postAsPage = null;
                this.data.pageId = null;
            }

            if (action.type === "TOPIC") {
                let search: SearchFilter = new SearchFilter();
                search.limit = 10;
                search.count = false;
                search.whereConditions = { ownerUser: this.authMgr.getCurrentUser().id };
                var aw = await this.pageFacade.search(search).then((pages: any) => {
                    this.pageInUser = pages
                }).catch((err: any) => {
                })
                for (let p of this.pageInUser) {
                    var aw = await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
                        p.img64 = res.data
                    }).catch((err: any) => {
                    });
                }
                return new Promise((resolve, reject) => {
                    const dialogRef = this.dialog.open(DialogReboonTopic, {
                        width: '550pt',
                        data: { options: { post: action.post, page: this.pageInUser, userAsPage: this.userAsPage, pageUserAsPage: action.userAsPage } }
                    });

                    dialogRef.afterClosed().subscribe(result => {
                        if (!result) {
                            return;
                        }

                        if (result.isConfirm) {
                            if (result.pageId === 'แชร์เข้าไทมไลน์ของฉัน') {
                                this.data.pageId = null
                                if (result.text === "") {
                                    if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
                                        this.dataPost = action.post.referencePost._id
                                    } else {
                                        this.dataPost = action.post._id
                                    }
                                } else {
                                    this.dataPost = action.post._id
                                }
                            } else {
                                this.data.pageId = result.pageId
                                if (result.text === "") {
                                    if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
                                        this.dataPost = action.post.referencePost._id
                                    } else {
                                        this.dataPost = action.post._id
                                    }
                                } else {
                                    this.dataPost = action.post._id
                                }
                            }
                            this.data.detail = result.text
                            if (action.userAsPage.id !== undefined && action.userAsPage.id !== null) {
                                this.data.postAsPage = action.userAsPage.id
                            }
                            if (result.hashTag !== undefined && result.hashTag !== null) {
                                this.data.hashTag = result.hashTag
                            }

                            this.postFacade.rePost(this.dataPost, this.data).then((res: any) => {
                                resPost.posts[index].repostCount++
                                resPost.posts[index].isRepost = false;

                                let data = {
                                    res,
                                    type: "TOPIC"
                                }
                                resolve(data)
                            }).catch((err: any) => {
                                reject(err);
                            })
                        }
                    })
                });
            } else if (action.type === "NOTOPIC") {
                return new Promise((resolve, reject) => {
                    this.dataPost = action.post._id;
                    this.postFacade.rePost(this.dataPost, this.data).then(async (res: any) => {
                        resPost.posts[index].repostCount++;
                        resPost.posts[index].isRepost = true;
                        if (repostShare === "PAGE") {
                            if (this.data.pageId === null && this.data.postAsPage === null) {
                                return;
                            }
                        } else {
                            if (this.data.pageId !== null && this.data.postAsPage !== null) {
                                return;
                            }
                        }

                        let searchWherePost: SearchFilter = new SearchFilter();
                        searchWherePost.whereConditions = { _id: res.id };
                        let searchPost = await this.searchById(searchWherePost);

                        if (searchPost) {
                            let postIndex: number = 0
                            let galleryIndex = 0;
                            if (searchPost[0].gallery.length > 0) {
                                for (let img of searchPost[0].gallery) {
                                    if (img.imageURL !== '') {
                                        await this.getDataGallery(img.imageURL, postIndex, galleryIndex, resPost);
                                        galleryIndex++
                                    }
                                }
                                postIndex++;
                            }

                            if (searchPost[0].referencePost !== null && searchPost[0].referencePost !== undefined && searchPost[0].referencePost !== '') {
                                let search: SearchFilter = new SearchFilter();
                                search.count = false;
                                search.whereConditions = { _id: searchPost[0].referencePost };
                                this.postFacade.search(search).then(async (res: any) => {
                                    if (res.length !== 0) {
                                        searchPost[0].referencePostObject = res[0];
                                    } else {
                                        searchPost[0].referencePostObject = 'UNDEFINED PAGE';
                                    }
                                }).catch((err: any) => {
                                });
                            }
                            resPost.posts.push(searchPost[0]);
                            if (resPost.posts && resPost.posts && resPost.posts.length > 0) {
                                resPost.posts = resPost.posts.sort((a, b) => new Date(b.startDateTime).valueOf() - new Date(a.startDateTime).valueOf());
                            }

                            let data = {
                                posts: resPost.posts,
                                type: "NOTOPIC"
                            }
                            resolve(data);
                        }
                    }).catch((err: any) => {
                        console.log(err);
                        reject(err)
                    })
                })

            } else if (action.type === "UNDOTOPIC") {
                return new Promise((resolve, reject) => {
                    this.postFacade.undoPost(action.post._id).then((res: any) => {
                        resPost.posts[index].repostCount--;
                        resPost.posts[index].isRepost = false;
                        let data = {
                            res,
                            type: "UNDOTOPIC"
                        }
                        resolve(data);

                    }).catch((err: any) => {
                        console.log(err);
                        reject(err);
                    })
                });
            }

        } else if (action.mod === 'LIKE') {
            let data = {
                type: "LIKE"
            }
            return data;
        } else if (action.mod === 'SHARE') {
        } else if (action.mod === 'COMMENT') {
        } else if (action.mod === 'POST') {
            let data = {
                pageId: action.pageId,
                type: "POST"
            }
            return data;
        }
    }

    public async searchById(search: any) {
        return this.postFacade.search(search);
    }

    private async getDataGallery(imageURL: any, postIndex: number, galleryIndex: number, resPost: any) {
        this.assetFacade.getPathFile(imageURL).then((res: any) => {
            if (res.status === 1) {
                Object.assign(resPost.posts[postIndex].gallery[galleryIndex], { galleryBase64: res.data, isLoaded: true });
            }
        }).catch((err: any) => {
            console.log('err ', err)
            if (err.error.status === 0) {
                if (err.error.message === 'Unable got Asset') {
                    Object.assign(resPost.posts[postIndex].gallery[galleryIndex], { galleryBase64: null, isLoaded: true });
                }
            }
        });
    }
}