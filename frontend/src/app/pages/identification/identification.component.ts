import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { saveProfile, startSession, logoutAll } from '../../utils/auth';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class IdentificationComponent implements OnInit {
  userName: string = '';
  email: string = '';
  password: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  ngOnInit() {
    // Limpar tudo na inicialização
    logoutAll();
    // Limpe todo o armazenamento para ficar mais seguro
    localStorage.clear();
    sessionStorage.clear();
  }

  constructor(private router: Router, private toastService: ToastService) {
    // Forçar a limpeza de qualquer sessão existente na criação do componente
    logoutAll();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Criar URL de visualização
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (!this.userName.trim() || !this.email.trim() || !this.password.trim()) {
      this.toastService.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Salve o novo perfil e inicie a sessão de 4h
    saveProfile({ name: this.userName.trim(), email: this.email.trim(), photo: this.previewUrl || null });
    startSession(4);
    // Backward-compat keys
    localStorage.setItem('userName', this.userName.trim());
    if (this.previewUrl) localStorage.setItem('userPhoto', this.previewUrl);
    this.toastService.success('Perfil criado com sucesso!');
    this.router.navigate(['/interaction']);
  }

  onBack() {
    this.router.navigate(['/']);
  }

}