import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { getProfile, logoutAll } from '../../utils/auth';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.css'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, EditProfileComponent]
})
export class ProfileMenuComponent implements OnInit {
  isMenuOpen = false;
  profile: any = null;
  defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2U5MWU2MyIvPjxwYXRoIGQ9Ik0yMCAxMmE0IDQgMCAxIDAgMCA4IDQgNCAwIDAgMCAwLTh6bTAgMTBjLTQuNDIgMC04IDMuNTgtOCA4djJoMTZ2LTJjMC00LjQyLTMuNTgtOC04LTh6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';
  
  constructor(private router: Router) {}

  ngOnInit() {
    this.profile = getProfile();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    logoutAll();
    this.router.navigate(['/']);
  }

  @ViewChild(EditProfileComponent) editProfileModal!: EditProfileComponent;

  editProfile() {
    this.closeMenu();
    this.editProfileModal.open();
  }

  // Fecha o menu se clicar fora dele
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu')) {
      this.closeMenu();
    }
  }
}