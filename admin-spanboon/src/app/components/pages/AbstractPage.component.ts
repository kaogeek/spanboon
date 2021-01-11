/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { ViewChild, Output, EventEmitter } from '@angular/core';
import { Field, FieldTable, ActionTable, TableComponent, DialogWarningComponent } from '../shares/shares';
import { MatDrawer, MatDialog } from '@angular/material'; 

export abstract class AbstractPage { 

    @Output()
    public back: EventEmitter<any> = new EventEmitter();
    @ViewChild("drawer")
    public drawer: MatDrawer;
    @ViewChild("table")
    public table: TableComponent;
    public titleForm: string;
    public fieldTable: FieldTable[];
    public actions: ActionTable;
    public fields: Field[];
    public dialog: MatDialog;

    constructor(titleForm: string, dialog: MatDialog) { 
        this.titleForm = titleForm;
        this.dialog = dialog; 
    }

    public clickBack(): void {
        this.back.emit(null);
    }

    public clickCloseDrawer(): void {
        this.drawer.toggle();
    }

    public dialogWarning(message: string): void {
        this.table.isLoading = false;
        this.dialog.open(DialogWarningComponent, {
            data: {
                title: message,
                error: true
            }
        });
    }
}
