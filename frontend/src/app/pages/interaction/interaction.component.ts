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
  isReadingPhoto: boolean = false;
  currentFileReader: FileReader | null = null;
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
      this.currentFileReader = reader;
      this.isReadingPhoto = true;
      reader.onload = () => {
        this.photoPreviewUrl = reader.result as string;
        this.isReadingPhoto = false;
        this.currentFileReader = null;
      };
      reader.onerror = () => {
        // If reading fails, clear state so user can retry
        this.isReadingPhoto = false;
        this.currentFileReader = null;
        this.selectedPhoto = null;
        this.photoPreviewUrl = null;
      };
      reader.onabort = () => {
        // User cancelled the read
        this.isReadingPhoto = false;
        this.currentFileReader = null;
        this.selectedPhoto = null;
        this.photoPreviewUrl = null;
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
      // If we already have a preview DataURL (fast path), reuse it and avoid re-reading the file.
      if (this.photoPreviewUrl) {
        savePost(this.photoPreviewUrl, this.selectedVideo ? this.videoPreviewUrl || undefined : undefined);
      } else {
        // Fallback: read the file now and keep a reference to allow aborting if needed
        const reader = new FileReader();
        this.currentFileReader = reader;
        reader.onload = () => {
          savePost(reader.result as string, this.selectedVideo ? this.videoPreviewUrl || undefined : undefined);
          this.currentFileReader = null;
        };
        reader.onerror = () => {
          // reading failed - clear and do not navigate
          this.currentFileReader = null;
        };
        reader.onabort = () => {
          this.currentFileReader = null;
        };
        reader.readAsDataURL(this.selectedPhoto);
      }
    } else {
      // No photo, just message and/or video
      savePost(undefined, this.selectedVideo ? this.videoPreviewUrl || undefined : undefined);
    }
  }

  cancelUpload() {
    // Abort any in-progress FileReader
    try {
      if (this.currentFileReader && (this.currentFileReader.readyState !== 2)) {
        // readyState 2 === DONE
        this.currentFileReader.abort();
      }
    } catch (e) {
      // ignore
    }

    // Clear selected files and previews
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
    this.selectedVideo = null;
    if (this.videoPreviewUrl) {
      try { URL.revokeObjectURL(this.videoPreviewUrl); } catch(e) {}
    }
    this.videoPreviewUrl = null;

    // Clear file input elements so the same file can be selected again if desired
    const photoInput = document.getElementById('photoInput') as HTMLInputElement | null;
    if (photoInput) photoInput.value = '';
    const videoInput = document.getElementById('videoInput') as HTMLInputElement | null;
    if (videoInput) videoInput.value = '';
  }

  get remainingCharacters() {
    return this.maxLength - this.message.length;
  }

}
