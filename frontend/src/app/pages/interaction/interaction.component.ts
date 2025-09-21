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

  async submitMessage() {
    // Allow submit if there's a typed message, a selected photo, a selected video, or an existing preview URL
    if (!(this.message.trim() || this.selectedPhoto || this.selectedVideo || this.photoPreviewUrl)) return;

    const userName = localStorage.getItem('userName') || 'Convidado';

    const savePost = (photoDataUrl?: string, videoDataUrl?: string) => {
      const raw = localStorage.getItem('posts');
      const posts = raw ? JSON.parse(raw) : [];
      posts.unshift({
        id: Date.now(),
        userName,
        userPhoto: localStorage.getItem('userPhoto') || 'assets/avatar-1.jpg',
        photo: photoDataUrl || null,
        // store video as data URL as well so it persists across sessions
        video: videoDataUrl || null,
        message: this.message || '',
        date: new Date().toISOString()
      });
      localStorage.setItem('posts', JSON.stringify(posts));
      // Clear local state before navigating so the component doesn't hold stale data
      this.message = '';
      this.selectedPhoto = null;
      this.photoPreviewUrl = null;
      if (this.videoPreviewUrl) {
        try { URL.revokeObjectURL(this.videoPreviewUrl); } catch(e) {}
      }
      this.selectedVideo = null;
      this.videoPreviewUrl = null;
      const photoInput = document.getElementById('photoInput') as HTMLInputElement | null;
      if (photoInput) photoInput.value = '';
      const videoInput = document.getElementById('videoInput') as HTMLInputElement | null;
      if (videoInput) videoInput.value = '';

      this.router.navigate(['/gallery']);
    };

    // Helper to read a File as DataURL
    const readFileAsDataURL = (file: File) => {
      return new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        this.currentFileReader = r;
        r.onload = () => { this.currentFileReader = null; resolve(r.result as string); };
        r.onerror = () => { this.currentFileReader = null; reject(new Error('read error')); };
        r.onabort = () => { this.currentFileReader = null; reject(new Error('aborted')); };
        r.readAsDataURL(file);
      });
    };

    try {
      let photoDataUrl: string | undefined = undefined;
      let videoDataUrl: string | undefined = undefined;

      if (this.photoPreviewUrl) {
        // already have a DataURL preview
        photoDataUrl = this.photoPreviewUrl;
      } else if (this.selectedPhoto) {
        photoDataUrl = await readFileAsDataURL(this.selectedPhoto);
      }

      if (this.selectedVideo) {
        // Convert video file to DataURL so it persists
        videoDataUrl = await readFileAsDataURL(this.selectedVideo);
      } else if (this.videoPreviewUrl && !this.selectedVideo) {
        // In case videoPreviewUrl was created with createObjectURL but file not set, avoid storing object URL
        videoDataUrl = undefined;
      }

      savePost(photoDataUrl, videoDataUrl);
    } catch (e) {
      // read failed - do not navigate away
      // leave state so user can retry
      return;
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
