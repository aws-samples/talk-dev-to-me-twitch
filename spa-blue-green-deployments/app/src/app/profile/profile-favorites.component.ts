import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ArticleListConfig, Profile } from '../core';

@Component({
  selector: 'app-profile-favorites',
  templateUrl: './profile-favorites.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileFavoritesComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  profile: Profile;
  favoritesConfig: ArticleListConfig = {
    type: 'all',
    filters: {}
  };

  ngOnInit() {
    this.route.parent.data.subscribe(
      (data: {profile: Profile}) => {
        this.profile = data.profile;
        this.favoritesConfig = {...this.favoritesConfig};
        this.favoritesConfig.filters.favorited = this.profile.username;
        this.cd.markForCheck();
      }
    );
  }

}
