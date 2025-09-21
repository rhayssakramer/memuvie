import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { logoutAll } from '../../utils/auth';

@Component({
  selector: 'app-interaction',
  templateUrl: './interaction.component.html',
  styleUrls: ['./interaction.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class InteractionComponent implements OnInit {
  message: string = '';
  selectedPhoto: File | null = null;
  photoPreviewUrl: string | null = null;
  selectedVideo: File | null = null;
  videoPreviewUrl: string | null = null;
  maxLength: number = 5000;

  constructor(private router: Router) {}

  ngOnInit() {
    // No-op; route guards handle auth/session.
  }

  logout() {
    logoutAll(); // Clear session and profile
    this.router.navigate(['/login']);
  }

  openFileUpload() {
    document.getElementById('fileInput')?.click();
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPhoto = input.files[0];
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedPhoto);
    }
  }

  openVideoCapture() {
    (document.getElementById('videoInput') as HTMLInputElement)?.click();
  }

  onVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedVideo = input.files[0];
      const url = URL.createObjectURL(this.selectedVideo);
      this.videoPreviewUrl = url;
    }
  }

  openPhotoCapture() {
    (document.getElementById('photoInput') as HTMLInputElement)?.click();
  }

  submitMessage() {
    if (!(this.message.trim() || this.selectedPhoto || this.selectedVideo)) return;

    const userName = localStorage.getItem('userName') || 'Convidado';

    const savePost = (photoDataUrl?: string, videoObjectUrl?: string) => {
      const raw = localStorage.getItem('posts');
      const posts = raw ? JSON.parse(raw) : [];
      posts.unshift({
        id: Date.now(),
        userName,
        userPhoto: localStorage.getItem('userPhoto') || 'assets/avatar-1.jpg',
        photo: photoDataUrl || null,
        video: videoObjectUrl || null,
        message: this.message || '',
        date: new Date().toISOString()
      });
      localStorage.setItem('posts', JSON.stringify(posts));
      this.router.navigate(['/gallery']);
    };

    if (this.selectedPhoto) {
      const reader = new FileReader();
      reader.onload = () => savePost(reader.result as string, this.selectedVideo ? this.videoPreviewUrl || undefined : undefined);
      reader.readAsDataURL(this.selectedPhoto);
    } else {
      // No photo, just message and/or video
      savePost(undefined, this.selectedVideo ? this.videoPreviewUrl || undefined : undefined);
    }
  }

  get remainingCharacters() {
    return this.maxLength - this.message.length;
  }

}
