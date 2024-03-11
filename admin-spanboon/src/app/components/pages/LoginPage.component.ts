/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthenManager } from '../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { DialogWarningComponent } from '../shares/DialogWarningComponent.component';
// import {
//     ApexAxisChartSeries,
//     ApexChart,
//     ChartComponent,
//     ApexDataLabels,
//     ApexXAxis,
//     ApexPlotOptions,
//     ApexFill,
// } from 'ng-apexcharts';
const PAGE_NAME: string = "login";

// export type ChartOptions = {
//     series: ApexAxisChartSeries;
//     chart: ApexChart;
//     fill: ApexFill;
//     colors: String[];
//     dataLabels: ApexDataLabels;
//     plotOptions: ApexPlotOptions;
//     xaxis: ApexXAxis;
// };

@Component({
    selector: 'admin-login-page',
    templateUrl: './LoginPage.component.html'
})
export class LoginPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    private dialog: MatDialog;
    private authenManager: AuthenManager;
    private router: Router;

    public isLoading: boolean = false;
    public username: string = "";
    public password: string = "";

    // @ViewChild("chart") public chart: ChartComponent;
    // public chartOptions: Partial<ChartOptions>;

    constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog) {
        this.dialog = dialog;
        this.router = router;
        this.authenManager = authenManager;

        // this.chartOptions = {
        //     series: [
        //         {
        //             name: 'גוייס',
        //             data: [12000],
        //         },
        //         {
        //             name: 'התחייבויות',
        //             data: [2465606],
        //         },
        //     ],
        //     colors: ['rgb(0, 227, 150)', '#F6AD55'],
        //     chart: {
        //         type: 'bar',
        //         stacked: true,
        //         height: '150px',
        //     },
        //     plotOptions: {
        //         bar: {
        //             horizontal: true,
        //         },
        //     },
        //     dataLabels: {
        //         // enabled: true,
        //     },
        //     xaxis: {
        //         categories: ['השלב השני'],
        //     },
        // };
    }

    public ngOnInit() {
        if (this.authenManager.getUserToken()) {
            this.router.navigateByUrl("main/item");
        }
    }

    public clickLogin(): void {
        if (this.username.trim() === "") {
            this.dialogWarning("กรุณาใส่ username");
            return;
        }
        if (this.password.trim() === "") {
            this.dialogWarning("กรุณาใส่ password");
            return;
        }
        this.isLoading = true;
        setTimeout(() => {
            this.authenManager.loginAdmin(this.username, this.password).then((res) => {
                this.isLoading = false;
                this.router.navigateByUrl("main/dashboard")
            }).catch((err) => {
                this.isLoading = false;
                this.dialogWarning(err.error.message);
                // this.dialogWarning("เกิดข้อผิดพลาด");
            });
        }, 500);
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
