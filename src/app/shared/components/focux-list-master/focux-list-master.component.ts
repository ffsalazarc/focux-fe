import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-focux-list-master',
    templateUrl: './focux-list-master.component.html',
    styleUrls: ['./focux-list-master.component.scss'],
})
export class FocuxListMasterComponent {
    @Input() listMaster$: Observable<any[]>;
    @Input() selectedRequestMaster: any;
    @Input() Title: string;

    page_size: number = 10;
    page_number: number = 1;
    pageSizeOptions = [10, 20, 50, 100];

    constructor() {}

    handlePage(e: PageEvent) {
        this.page_size = e.pageSize;
        this.page_number = e.pageIndex + 1;
    }
}
