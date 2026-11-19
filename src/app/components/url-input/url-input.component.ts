import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkCircle, linkOutline } from 'ionicons/icons';
import { APP, GENERAL } from '../../constants/constants';
import { YoutubeMetadata } from '../../models/internal/metadata.youtube.model';

@Component({
  selector: 'app-url-input',
  templateUrl: './url-input.component.html',
  styleUrls: ['./url-input.component.scss'],
  imports: [
    IonIcon
  ],
})
export class UrlInputComponent {

  @Input() disabled: boolean = false;

  @Output() youtubeDataLoaded = new EventEmitter<{
    url: string,
    metadata: YoutubeMetadata | null
  }>();

  public readonly url = signal<string>(GENERAL.EMPTY_STRING);
  public readonly isFetching = signal<boolean>(false);
  public readonly metadata = signal<YoutubeMetadata | null>(null);

  constructor() {
    addIcons({ linkOutline, checkmarkCircle, alertCircleOutline });
  }

  async onInputChange(event: Event): Promise<void> {
    
    const inputUrl = (event.target as HTMLInputElement).value.trim();

    this.url.set(inputUrl);
    this.metadata.set(null);

    if (!APP.YOUTUBE_REGEX.test(inputUrl)) {
      this.emitUrlAndMetadataNull(inputUrl);
      return;
    } 

    this.isFetching.set(true);

    try {
      const response = await fetch(`${APP.NOEMBED_URL}${inputUrl}`);
      const data = await response.json();

      if (!data.error) {
        const newMetadata = {
          title: data.title,
          thumbnail: data.thumbnail_url
        };
        this.metadata.set(newMetadata);

        this.youtubeDataLoaded.emit({ url: inputUrl, metadata: newMetadata });
      } else {
        this.emitUrlAndMetadataNull(inputUrl);
      }
    } catch(e) {
      console.error('Error fetching Youtube Metadata', e);
    } finally {
      this.isFetching.set(false);
    }
  }

  private emitUrlAndMetadataNull(url: string) : void {
    this.youtubeDataLoaded.emit({ url: url, metadata: null });
  }
}
