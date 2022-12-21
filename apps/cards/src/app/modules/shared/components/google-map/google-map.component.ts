import {Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Loader} from "@googlemaps/js-api-loader";
import {ConstService} from "../../../../services/const.service";

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GoogleMapComponent implements OnInit {

  @ViewChild('map', { static: true }) mapRef: ElementRef;
  @Input() location: string;
  @Input() polyline: string;
  @Input() activityType: string;

  private loader = new Loader({
    apiKey: ConstService.MAP_CONFIG.mapKey,
    version: "weekly",
    libraries: ['geometry']
  });

  private map: any;

  constructor() { }

  ngOnInit(): void {

    this.loader.load().then(() => {
      console.log('polyline', this.polyline);
      const decoded = google.maps.geometry.encoding.decodePath(this.polyline);
      console.log('decoded', decoded);

      this.map = new google.maps.Map(this.mapRef.nativeElement as HTMLElement, {
        center: decoded[(Math.floor(decoded.length / 2))],
        zoom: 11,
        clickableIcons: false,
        disableDefaultUI: true,
        disableDoubleClickZoom: true
      });

        var line = new google.maps.Polyline({
            path: decoded,
            strokeColor: this.getColor(this.activityType),
            strokeOpacity: 1.0,
            strokeWeight: 3,
            zIndex: 5
        });

        line.setMap(this.map);
        this.zoomToObject(line)
    });
  }

  zoomToObject(obj: any){
    const bounds = new google.maps.LatLngBounds();
    const points = obj.getPath().getArray();
    for (let n = 0; n < points.length ; n++){
        bounds.extend(points[n]);
    }
    this.map.fitBounds(bounds);
    setTimeout(() => {
        this.map.setZoom(this.map.getZoom() + 1)
    }, 200)
  }

  getColor(type: string) {
      switch (type) {
          case 'run': return '#EC4444';
          case 'walk': return '#ECB844';
          case 'ride': return '#494ADB';
          default: return '#B754F3';
      }
  }

}
