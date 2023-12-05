/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NewsPaper } from '../../../models/NewsPaper';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { NewsPaperFacade } from '../../../services/facade/NewsPaperFacade.service';

const PAGE_NAME: string = "newspaper";

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;
@Component({
    selector: 'admin-newspaper-page',
    templateUrl: './NewsPaperPage.component.html'
})
export class NewsPaperPage extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;

    @ViewChild('myInput') myInputVariable: ElementRef;
    @ViewChild('inputOrder') public inputOrder: ElementRef;

    public newsPaperFacade: NewsPaperFacade;
    public dataForm: NewsPaper;
    constructor(
        newsPaperFacade: NewsPaperFacade,
        dialog: MatDialog,
    ) {
        super(PAGE_NAME, dialog);
        this.newsPaperFacade = newsPaperFacade;
        // if (!this.authenManager.isCurrentUserType()) {
        //     this.router.navigateByUrl("/main/home_content/pageslide")
        // }
        this.fieldTable = [
            {
                name: "image",
                label: "ก้าวไกลหน้าหนึ่ง",
                width: "100pt",
                class: "", formatColor: false, formatImage: true,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "startDate",
                label: "สร้างเมื่อ",
                width: "100pt",
                class: "", formatColor: false, formatImage: true,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
            {
                name: "endDate",
                label: "หนังสือพิมพ์ฉบับวันที่",
                width: "100pt",
                class: "", formatColor: false, formatImage: true,
                link: [],
                formatDate: false,
                formatId: false,
                align: "center"
            },
        ];
        this.actions = {
            isOfficial: false,
            isBan: false,
            isApprove: false,
            isUnApprove: false,
            isSelect: false,
            isCreate: false,
            isEdit: false,
            isDelete: true,
            isComment: false,
            isBack: false
        };
        this.setFields();

    }
    private setFields(): void {
        this.dataForm = new NewsPaper();
        this.dataForm.data = "";
        this.dataForm.startDateTime = "";
        this.dataForm.endDateTime = "";
    }
    public ngOnInit() {
        this.table.isNews = true;
    }
    public clickDelete(data: any): void {
        this.newsPaperFacade.delete(data.id).then((res) => {
            let index = 0;
            let dataTable = this.table.data;
            for (let d of dataTable) {
                if (d.id == data.id) {
                    dataTable.splice(index, 1);
                    this.table.setTableConfig(dataTable);
                    // alert("success");
                    this.dialogWarning("ลบข้อมูลสำเร็จ");
                    break;
                }
                index++;
            }
        }).catch((err) => {
            this.dialogWarning(err.error.message);
        });
    }
}