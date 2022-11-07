import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { switchMap, takeUntil, debounceTime } from 'rxjs/operators';
import { SearchService } from './focux-search.service';



@Component({
    selector: 'app-focux-search',
    templateUrl: './focux-search.component.html',
    styleUrls: ['./focux-search.component.scss']
})

export class FocuxSearchComponent implements OnInit {
    // ======================================
    //				Inputs
    // ======================================
    @Input() placeholder = "Buscar";
    @Input() searchUrl = "";
    @Output() onSearch = new EventEmitter<any>();

    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _searchservice: SearchService,
    ) { }

    ngOnInit(): void {
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(500),
                switchMap((query) => {
                   return this._searchservice.searchCategory(query, this.searchUrl)
                })
            )
            .subscribe(
                (res)=> this.onSearch.emit(res)
            );
    }

}
