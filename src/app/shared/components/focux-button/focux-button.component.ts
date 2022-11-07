import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'focux-button',
  templateUrl: './focux-button.component.html',
  styleUrls: ['./focux-button.component.scss']
})
export class FocuxButtonComponent implements OnInit {
  @Input() type: 'primary' | 'secondary' | 'cancel' | 'accept' | 'defuse' | 'primary-rounded' | 'secondary-rounded' = 'primary';
  @Input() disabled = false;
  @Input() route = '';
  @Output() buttonClick = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

}
