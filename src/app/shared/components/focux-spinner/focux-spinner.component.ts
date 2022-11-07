import { Component, Input, OnInit } from '@angular/core';
import { SpinnerService } from 'app/core/services/spinner/spinner.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-focux-spinner',
  templateUrl: './focux-spinner.component.html',
  styleUrls: ['./focux-spinner.component.scss']
})
export class FocuxSpinnerComponent implements OnInit {

  @Input() diameter: number = 50;
  
  isLoading$: Observable<boolean> = new Observable();

  constructor(private _spinnerService: SpinnerService) { }

  ngOnInit(): void {
    this.isLoading$ = this._spinnerService.isLoading$;
  }


}
