/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { publish } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'card-contant-home',
    templateUrl: './CardContentHome.component.html'
})
export class CardContentHome {


    @Input()
    public postData: any;
    @Input()
    public eventData: any;
    @Input()
    public tagData: any;

    @Input()
    public smallCard: boolean;
    @Input()
    public mediumCard: boolean;
    @Input()
    public largeCard: boolean;
    @Input()
    public eventCard: boolean;

    @Input()
    public tagCard: boolean;
    @Input()
    public tagCardIsOpenRight: boolean;

    public amountSocial: number = 0;
    public eventDataAct: number = 0;
    public isOfficial: boolean = true;
    public apiBaseURL = environment.apiBaseURL;

    // event //
    public eventCoverPageUrl: string = '';
    public eventTitle: string = '';
    public eventDescription: string = '';

    public eventRepostCount: number;
    public eventLikeCount: number;
    public eventCommentCount: number;
    public eventShareCount: number;

    public dateTime: any;


    // hashTag //
    public datahashTagArrPosts: any;
    public datahashTagPost: any;

    public hashTagRepostCount: number;
    public hashTagLikeCount: number;
    public hashTagCommentCount: number;
    public hashTagShareCount: number;



    public testObj: any = [
        {
            name: "P.Nut"
        },
        {
            name: "P.B"
        },
        {
            name: "P.O"
        },
        {
            name: "P.T",
            needs: [
                { name: "AA" },
                { name: "BB" },
                { name: "CC" },
                { name: "DD" },
            ]
        },
    ]


    public isLoad: boolean = true;

    ngOnInit(): void {
        setTimeout(() => {

            if (this.isDerTy(this.postData)) {
                this.amountSocial = (this.postData.likeCount + this.postData.repostCount + this.postData.shareCount);
            }

            if (this.isDerTy(this.eventData)) {
                this.eventDataAct = this.eventData[0];
                this.eventCoverPageUrl = this.eventData[0].coverPageUrl;
                this.eventTitle = this.eventData[0].title;
                this.eventDescription = this.eventData[0].description;
                this.dateTime = this.eventData[0].dateTime;
                this.eventRepostCount = this.eventData[0].repostCount;
                this.eventLikeCount = this.eventData[0].likeCount;
                this.eventCommentCount = this.eventData[0].commentCount;
                this.eventShareCount = this.eventData[0].shareCount;

                for (let index = 0; index < this.eventData.length; index++) {
                    this.eventData.splice(0, 1);
                    if (this.eventData.length == 3) {
                        break
                    }
                }
            }

            if (this.isDerTy(this.tagData)) {
                this.datahashTagArrPosts = this.tagData.posts
                if (this.tagCardIsOpenRight) {
                    this.datahashTagPost = this.tagData.posts[0]
                    this.hashTagRepostCount = this.tagData.posts[0].repostCount;
                    this.hashTagLikeCount = this.tagData.posts[0].likeCount;
                    this.hashTagCommentCount = this.tagData.posts[0].commentCount;
                    this.hashTagShareCount = this.tagData.posts[0].shareCount;
                }
            }

            setTimeout(() => {
                this.isLoad = false;
            }, 1000);

        }, 2000);
    }

    ngAfterViewInit(): void {
        this.duplicateObjFunction(this.testObj, 'name');

    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    isDerTy(value): boolean {

        return (value !== null && value !== undefined && value !== '')
    }

    duplicateObjFunction(ArrayObj, keyObj) {

        for (let arr of ArrayObj) [
        ]

        console.log(ArrayObj[0][keyObj] ? ArrayObj[0][keyObj] : "sadasd");
        console.log(ArrayObj[keyObj] ? ArrayObj[keyObj] : "und");

    }

}
