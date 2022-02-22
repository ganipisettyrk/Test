import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-image-loader',
  templateUrl: './custom-image-loader.component.html',
  styleUrls: ['./custom-image-loader.component.css']
})
export class CustomImageLoaderComponent implements OnInit {

  @Input() actualImgSrc: string;
  @Input() loadImgSrc: string;
  @Input() defaultImgSrc: string;
  @Input() showImage: boolean
  @Input() isBannerImage: boolean;

  loading: boolean = true;

  onLoad() {
    this.loading = false;
  }

  constructor() { }

  ngOnInit() {

    if (null == this.showImage) {
      this.showImage = true;
    }
  }

}
