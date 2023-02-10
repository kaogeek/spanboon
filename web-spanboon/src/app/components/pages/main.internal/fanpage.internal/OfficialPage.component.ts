import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PageFacade } from '../../../../services/facade/PageFacade.service';
import { Page } from '../../../../models/Page';
import { SearchFilter } from '../../../../models/SearchFilter';

const PAGE_NAME: string = 'official';

@Component({
    selector: 'official',
    templateUrl: './OfficialPage.component.html'
})
export class OfficialPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    private pageSizeOptions: number[] = [15, 25, 50];
    public displayedColumns: string[] = ['pageName', 'createdDate'];
    public dataSource = new MatTableDataSource<Page>();
    public isOfficial: boolean = true;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(private pageFacade: PageFacade) {
    }

    ngOnInit(): void {
        this.initTable();
        this.searchPage(this.isOfficial);
    }

    public filterPage(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    public onOfficialChange() {
        this.isOfficial = !this.isOfficial;
        this.searchPage(this.isOfficial);
    }

    private initTable() {
        const paginator: MatPaginator = this.paginator;
        paginator.pageSizeOptions = this.pageSizeOptions;

        this.dataSource.paginator = paginator;
        this.dataSource.sort = this.sort;
    }

    private searchPage(isOfficial: boolean) {
        const searchFilter: SearchFilter = new SearchFilter();
        searchFilter.whereConditions = { isOfficial };
        searchFilter.orderBy = { createdDate: -1 };

        this.pageFacade.search(searchFilter).then((res: Page[]) => {
            this.dataSource.data = res;
        });
    }
}