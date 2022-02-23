import { Component, OnInit } from '@angular/core';
import { CommonService } from '../utils/common.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  errorMessage: string;

  constructor(public commonService: CommonService) { }

  ngOnInit() {
    this.commonService.getGenericErrorDescription().subscribe(
      res => {
        this.errorMessage = res;
      }
    );
  }

}
