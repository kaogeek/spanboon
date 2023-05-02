/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, ViewChild, Output, EventEmitter, SimpleChanges, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from './DialogDeleteComponent.component';
import { DialogWarningComponent } from './DialogWarningComponent.component';
import { SearchFilter } from '../../models/SearchFilter';
import { FormControl } from '@angular/forms';
import { CdkDragDrop, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { EmergencyEventFacade } from '../../services/facade/EmergencyEventFacade.service';
import { element } from 'protractor';

const speed = 10;
const SEARCH_LIMIT: number = 0;
const SEARCH_OFFSET: number = 0;
const DEFAULT_DATE_TIME_FORMAT: string = "dd-MM-yyyy HH:mm:ss";
const ITEMS_PER_PAGE: string = 'รายการต่อหน้า';
const BASE_MODEL: string[] = [
    'createdDate',
    'createdByUsername',
    'updateDate',
    'updateByUsername',
    'action'
];
const LOGS_BASE_MODEL: string[] = [
    'userId',
    'action',
    'date',
    'detail'
];

interface LinkTable {
    link: string;
    isField: boolean;
}

export interface FieldTable {
    name: string;
    label: string;
    width: string;
    align: "center" | "left" | "right";
    class: string | string[];
    formatId: boolean;
    select?: boolean;
    formatDate: boolean;
    formatColor: boolean;
    formatImage: boolean;
    link: LinkTable[];
}

export interface ActionTable {
    isOfficial: boolean;
    isBan: boolean;
    isApprove: boolean;
    isUnApprove: boolean;
    isSelect: boolean;
    isCreate: boolean;
    isEdit: boolean;
    isDelete: boolean;
    isComment: boolean;
    isBack: boolean;
}

@Component({
    selector: 'admin-table-component',
    templateUrl: './TableComponent.component.html'
})
export class TableComponent implements OnInit {
    @ViewChild('table') table: MatTable<FieldTable>;
    @ViewChild('scrollEl') scrollEl: ElementRef<HTMLElement>;
    private dialog: MatDialog;

    @Input()
    public facade: any;
    @Input()
    public orderBy: any;
    @Input()
    public isUser: any;
    @Input()
    public isPin: boolean;
    @Input()
    public isLogs: boolean;
    @Input()
    public title: string;
    @Input()
    public relation: string[];
    @Input()
    public fieldTable: FieldTable[];
    @Input()
    public actions: ActionTable;
    @Input()
    public fieldSearch: string[];
    @Input()
    public isApprovePage: boolean;
    @Input()
    public active: boolean;
    @Input()
    public user: boolean;
    @Input()
    public userAdmin: boolean;
    @Input()
    public isBanfilter: boolean;
    @Input()
    public isOfficialPage: {};
    public fieldSearchs: string[];
    @Output() official: EventEmitter<any> = new EventEmitter();
    @Output() ban: EventEmitter<any> = new EventEmitter();
    @Output() approve: EventEmitter<any> = new EventEmitter();
    @Output() unapprove: EventEmitter<any> = new EventEmitter();
    @Output() create: EventEmitter<any> = new EventEmitter();
    @Output() edit: EventEmitter<any> = new EventEmitter();
    @Output() delete: EventEmitter<any> = new EventEmitter();
    @Output() comment: EventEmitter<any> = new EventEmitter();
    @Output() back: EventEmitter<any> = new EventEmitter();


    public fieldOpen: any[] = [{ viwe: "All", value: "ทั้งหมด" }, { viwe: "OP", value: "ใช้งาน" }, { viwe: "CO", value: "ไม่ถูกใช้งาน" }];

    @ViewChild(MatPaginator)
    public paginator: MatPaginator;

    @ViewChild(MatSort)
    public sort: MatSort;
    public search: string;
    public defaultDateTimeFormat: string = DEFAULT_DATE_TIME_FORMAT;
    public displayedColumns: string[];
    public isLoading: boolean;
    public isBans: boolean;
    public isEmer: boolean = false;
    public isTodayPage: boolean = false;
    public isNews: boolean = false;
    public isShowSelect: boolean;
    public dataSource: MatTableDataSource<any>;
    public filters = new FormControl();
    public Open = new FormControl();
    public filtersBan = new FormControl();
    public data: any;
    public parentId: string;
    public widthAction: string;
    public arr: any[]
    public seletc: any[]
    public selected: any
    public selectItem: any;
    public item: any[];
    emergencyEventFacade: EmergencyEventFacade;
    constructor(dialog: MatDialog, emergencyEventFacade: EmergencyEventFacade) {
        this.emergencyEventFacade = emergencyEventFacade;
        this.dialog = dialog;
        this.search = "";
        this.fieldSearch = [];
        this.fieldSearchs = ["ที่ถูกระงับ"];
        this.data = [];
    }

    public ngOnInit() {
        this.arr = []
        this.seletc = []
        this.isBans = true
        this.displayedColumns = []
        for (let field of this.fieldTable) {
            this.displayedColumns.push(field.name);
            if (this.fieldSearch.length === 0 && (field.name === "title" || field.name === "name")) {
                this.fieldSearch.push(field.name);
            }
        }
        if (this.fieldSearch.length === 0) {
            if (!this.isLogs) {
                this.fieldSearch.push("created_by_username");
            } else {
                this.fieldSearch.push("userId");
                this.fieldSearch.push("action");
                this.fieldSearch.push("date");
                this.fieldSearch.push("detail");
            }
        }
        if (!this.isLogs) {
            this.displayedColumns.push.apply(this.displayedColumns, BASE_MODEL);
        } else {
            this.displayedColumns.push.apply(this.displayedColumns, LOGS_BASE_MODEL);
        }
        this.filters.setValue(this.fieldSearch);
        this.setTableConfig(this.data);
        if (!this.actions.isBack) {
            this.searchData();
        }
        this.widthAction = this.getWidthAction();
        this.sort.sortChange.subscribe(() => {
            this.searchData(false, true);
        });
        this.paginator.page.subscribe(() => {
            this.nextPage();
        });
        if (this.isUser === true) {
            this.fieldOpen = [{ viwe: "All", value: "ทั้งหมด" }, { viwe: "OP", value: "ใช้งาน" }, { viwe: "CO", value: "ไม่ถูกใช้งาน" }, { viwe: "ADMIN", value: "ผู้ดูแล" }];
            this.Open.setValue(this.fieldOpen[0].value);
        }
        if (this.isPin === true) {
            this.fieldOpen = [{ viwe: "All", value: "ทั้งหมด" }, { viwe: "PIN", value: "ที่ปักหมุด" },];
            this.Open.setValue(this.fieldOpen[0].value);
        }
    }

    public nextPage(): void {
        if (!this.paginator.hasNextPage()) {
            this.searchData(true);
        }
    }

    public banPage(isNextPage?: boolean, isSort?: boolean): void {
        this.isBans = !this.isBans
        this.isLoading = true;
        const o: any[] = [];
        let search: SearchFilter = new SearchFilter();
        search.orderBy = {};
        if (!this.isBans) {
            search.whereConditions = { banned: true };
        } else {
            search.whereConditions = { banned: false };
        }
        search.relation = this.relation;
        search.count = false;
        this.facade.search(search).then((res: any) => {
            if (this.user) {
                for (let r of res) {
                    if (!r.isAdmin) {
                        o.push(r);
                    }
                }
                res = o;
            }
            if (this.userAdmin) {
                for (let r of res) {
                    if (r.isAdmin) {
                        o.push(r);
                    }
                }
                res = o;
            }
            this.setTableConfig(res);
            this.isLoading = false;
        }).catch((err: any) => {
            if (!this.parentId) {
                this.dialogWarning(err.error.message);
            }
            this.setTableConfig([]);
            this.isLoading = false;
        });
    }

    public searchData(isNextPage?: boolean, isSort?: boolean): void {
        this.isLoading = true;
        this.seletc = [];
        this.arr = [];
        let search: SearchFilter = new SearchFilter();
        search.whereConditions = {};
        if (this.search.trim() !== "") {
            for (let field of this.filters.value) {
                search.whereConditions[field] = { $regex: this.search };
            }
        }
        search.limit = SEARCH_LIMIT;
        search.orderBy = this.orderBy;
        search.offset = isNextPage ? this.paginator.length : SEARCH_OFFSET;
        search.relation = this.relation;
        search.count = false;
        let stack = [];
        this.facade.search(search).then((res: any) => {
            const o: any[] = [];

            if (this.isApprovePage) {
                for (let r of res) {
                    if (r.approveUser === "") {
                        r.approveUser = 1
                    }
                    if (r.approveUser === null || r.approveUser === undefined || r.approveUser === '') {
                        o.push(r);
                    }
                }
                res = o;
            }
            if (this.active) {
                for (let r of res) {
                    if (r.active) {
                        o.push(r);
                    }
                }
                res = o;
            }
            if (this.user) {
                for (let r of res) {
                    o.push(r);
                    // if (!r.isAdmin) {
                    //     o.push(r);
                    // }
                }
                res = o;
            }
            if (this.userAdmin) {
                for (let r of res) {
                    if (r.isAdmin) {
                        o.push(r);
                    }
                }
                res = o;
            }
            if (isNextPage) {
                this.data = res;
            } else {
                this.paginator.pageIndex = 0;
                this.data = res ? res : [];
            }
            this.setTableConfig(this.data);
            // this.isLoading = false;
        }).catch((err: any) => {
            if (!this.parentId) {
                this.dialogWarning(err.error.message);
            }
            this.setTableConfig([]);
            this.isLoading = false;
            // this.dialogWarning(err.error.message);
        });
    }

    public disChek(data: any): boolean {
        if (data.standardItemId != null && data.standardItemId != undefined) {
            return false;
        } else {
            return true;
        }
    }

    public setTableConfig(data: any): void {
        // fix bug TypeError: data.slice is not a function
        if (!Array.isArray(data)) {
            return;
        }
        this.data = data;
        this.isLoading = false;
        this.dataSource = new MatTableDataSource<any>(this.data);
        this.paginator._intl.itemsPerPageLabel = ITEMS_PER_PAGE;
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length == 0 || pageSize == 0) {
                return `0 ของ ${length}`;
            }
            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
            return `${startIndex + 1} - ${endIndex} ของ ${length}`;
        };
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }
    dropTable(event: CdkDragDrop<FieldTable[]>) {
        if (this.isInvalidDragEvent) {
            this.isInvalidDragEvent = false;
            return;
        }
        const prevIndex = this.dataSource.filteredData.findIndex((d) => d === event.item.data);
        let body = {
            'previousIndex': prevIndex,
            'currentIndex': event.currentIndex,
            'filteredData': this.dataSource.filteredData
        }
        moveItemInArray(this.dataSource.filteredData, prevIndex, event.currentIndex);
        this.dataSource = new MatTableDataSource<any>(this.data);
        let dataItem = this.dataSource.filteredData[event.currentIndex].id;
        this.emergencyEventFacade.editSelect(dataItem, body).then((res: any) => {
            if (res) {
                this.searchData();
            }
        }).catch((err: any) => {
        })
        // this.table.renderRows();
    }
    isInvalidDragEvent: boolean = false;
    onInvalidDragEventMouseDown() {
        this.isInvalidDragEvent = true;
    }
    dragStarted(event) {
        if (this.isInvalidDragEvent) {
            document.dispatchEvent(new Event('mouseup'));
        }
    }

    public getWidthAction(): string {
        let ationWidth: number = 75;
        let count: number = 0;
        for (let action in this.actions) {
            if (action !== "isBack" && action !== "isCreate" && this.actions[action]) {
                count++;
            }
        }
        return (ationWidth * count) + "px";
    }

    public clearSerach() {
        this.search = "";
        this.dataSource.filter = "";

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    public searchDataByfield(data: any) {
        this.isLoading = true;
        const o: any[] = [];
        let search: SearchFilter = new SearchFilter();
        search.orderBy = {};
        search.whereConditions = {};
        search.relation = this.relation;
        search.count = false;
        this.facade.search(search).then((res: any) => {
            if (this.user) {
                if (data === 'OP') {
                    for (let r of res) {
                        if (r.banned === false) {
                            o.push(r);
                        }
                    }
                    res = o;
                } if (data === 'CO') {
                    for (let r of res) {

                        if (r.banned === true) {
                            o.push(r);
                        }
                    }
                    res = o;
                } if (data === 'ADMIN') {
                    for (let r of res) {

                        if (r.isAdmin === true) {
                            o.push(r);
                        }
                    }
                    res = o;
                }
            } else if (this.isPin) {
                if (data === 'ALL') {
                    for (let r of res) {
                        o.push(r);
                    }
                    res = o;
                } if (data === 'PIN') {
                    for (let r of res) {
                        if (r.isPin === true) {
                            o.push(r);
                        }
                    }
                    res = o;
                }
            } else {
                if (data === 'OP') {
                    for (let r of res) {
                        if (r.standardItemId != null && r.standardItemId != undefined) {
                            o.push(r);
                        }
                    }
                    res = o;
                } if (data === 'CO') {
                    for (let r of res) {
                        if (r.standardItemId === null) {
                            o.push(r);
                        }
                    }
                    res = o;
                }
            }
            this.setTableConfig(res);
            this.isLoading = false;
        }).catch((err: any) => {
            if (!this.parentId) {
                this.dialogWarning(err.error.message);
            }
            this.setTableConfig([]);
            this.isLoading = false;
        });

    }

    public clickApprove(data: any): void {
        this.approve.emit(data);
    }
    public clickUnApprove(data: any): void {
        this.unapprove.emit(data);
    }

    public clickOfficial(data: any): void {
        this.official.emit(data);
    }

    public clickBan(data: any): void {
        this.ban.emit(data);
    }

    public clickCreateForm(): void {
        if (this.seletc.length != 0) {
            console.log('create1 >>>> ', this.arr);

            this.create.emit(this.arr);
        } else {
            console.log('create2 >>>> ');
            this.create.emit(null);
        }
    }

    public clickEditForm(data: any): void {
        this.edit.emit(data);
    }
    public onSelect(data: any): void {
        if (this.arr.length != 0) {
            if (this.arr.includes(data._id)) {
                this.arr.splice((this.arr.indexOf(data._id)), 1);
                this.seletc.splice((this.seletc.indexOf(data._id)), 1);

            } else {
                this.arr.push(data._id);
                this.seletc.push(data);
            }
        } else {
            this.arr.push(data._id);
            this.seletc.push(data);
        }
    }

    public clickDelete(data: any): void {
        let dialogRef;
        if (data.name || data.title) {
            dialogRef = this.dialog.open(DialogDeleteComponent, {
                data: data
            });
        } else {
            dialogRef = this.dialog.open(DialogWarningComponent, {
                data: {
                    title: "คุณต้องการที่จะลบข้อมูลนี้ ?"
                }
            });
        }
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.delete.emit(data);
            }
        });
    }

    public clickComment(data: any): void {
        this.comment.emit(data);
    }

    public clickBack(): void {
        this.back.emit(null);
    }
    public dialogWarning(message: string): void {
        this.dialog.open(DialogWarningComponent, {
            data: {
                title: message,
                error: true
            }
        });
    }
}
