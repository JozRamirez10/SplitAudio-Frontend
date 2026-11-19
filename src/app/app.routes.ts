import { Routes } from '@angular/router';
import { GENERAL, PAGES } from './constants/constants';
import { SongListPage } from './pages/song-list/song-list.page';
import { SongUploadPage } from './pages/song-upload/song-upload.page';

export const routes: Routes = [
  {
    path: GENERAL.EMPTY_STRING,
    redirectTo: PAGES.SONGS,
    pathMatch: GENERAL.FULL
  },
  {
    path: PAGES.SONGS,
    component: SongListPage
  },
  {
    path: PAGES.UPLOAD_SONG,
    component: SongUploadPage
  }
];
