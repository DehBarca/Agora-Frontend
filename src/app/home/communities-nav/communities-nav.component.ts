import { Component, OnInit } from '@angular/core';
import { CommunityService } from '../../shared/services/community.service';
import { Community } from '../../shared/types/community';
import { Router } from '@angular/router';
import { ModalsService } from '../../shared/services/modals.service';
import { MatIcon } from '@angular/material/icon';
import { CreateCommunityModalComponent } from '../../shared/components/modals/create-community-modal/create-community-modal.component';

@Component({
  selector: 'app-communities-nav',
  imports: [MatIcon, CreateCommunityModalComponent],
  templateUrl: './communities-nav.component.html',
  styleUrl: './communities-nav.component.scss',
})
export class CommunitiesNavComponent implements OnInit {
  communities: Community[] = [];
  selectedCommunityId: string = '';
  isCreateCommunityOpen: boolean = false;

  constructor(
    private communityService: CommunityService,
    private router: Router,
    private modalsService: ModalsService
  ) {}

  ngOnInit(): void {
    this.communityService.myCommunities$.subscribe((communities) => {
      this.communities = communities;
    });
    this.communityService.getMyCommunities().subscribe();

    this.modalsService.openCreateCommunity$.subscribe((val) => this.isCreateCommunityOpen = val);
  }

  openCreateCommunity(): void {
    this.modalsService.openCreateCommunity();
  }
  selectCommunity(community: Community) {
    if (!community.communityImgUrl) community.communityImgUrl = '';
    this.communityService.updateCommunitySummary(community);
    this.router.navigateByUrl(`/home/community/${community._id}`);
  }

  goToHome() {
    this.communityService.cleanCommunitySummary();
    this.router.navigateByUrl(`/home`);
  }
}
