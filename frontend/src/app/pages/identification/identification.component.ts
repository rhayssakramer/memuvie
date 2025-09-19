import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { saveProfile, startSession } from '../../utils/auth';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class IdentificationComponent {
  userName: string = '';
  email: string = '';
  password: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private router: Router) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (!this.userName.trim() || !this.email.trim() || !this.password.trim()) return;
    // Save new profile and start 4h session
    saveProfile({ name: this.userName.trim(), email: this.email.trim(), photo: this.previewUrl || null });
    startSession(4);
    // Backward-compat keys
    localStorage.setItem('userName', this.userName.trim());
    if (this.previewUrl) localStorage.setItem('userPhoto', this.previewUrl);
    this.router.navigate(['/interaction']);
  }

  onBack() {
    this.router.navigate(['/']);
  }

}
