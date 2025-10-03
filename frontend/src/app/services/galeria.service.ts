import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, delay, map, switchMap } from 'rxjs/operators';

interface BackendPost {
  id: number;
  mensagem: string;
  urlFoto: string;
  urlVideo: string;
  dataCriacao: string;
  evento: {
    id: number;
  };
  usuario: {
    id: number;
    nome: string;
    email: string;
    fotoPerfil?: string;
  };
}
import { environment } from '../../environments/environment';

export interface GaleriaPost {
  id?: number;
  mensagem?: string;
  urlFoto?: string;  // Alterado de fotoUrl para urlFoto para corresponder ao backend
  urlVideo?: string;  // Alterado de videoUrl para urlVideo para corresponder ao backend
  dataCriacao?: string;
  eventoId?: number;  // Voltando a ser opcional
  usuario?: {
    id: number;
    nome: string;
    email: string;
    fotoPerfil?: string;
  };
}

interface GaleriaPostRequest {
  mensagem?: string;
  urlFoto?: string;
  urlVideo?: string;
  eventoId: number;
}

interface EventoResponse {
  id: number;
  titulo: string;
}

@Injectable({
  providedIn: 'root'
})
export class GaleriaService {
  private apiUrl = `${environment.apiUrl}/api/galeria`;
  private readonly STORAGE_EVENTO_KEY = 'defaultEventoId';
  private readonly CANONICAL_EVENT_TITLE = 'Galeria Memuvie';

  constructor(private http: HttpClient) { }

  private getStoredEventoId(): number | null {
    try {
      const v = localStorage.getItem(this.STORAGE_EVENTO_KEY);
      return v ? Number(v) : null;
    } catch { return null; }
  }

  private setStoredEventoId(id: number) {
    try { localStorage.setItem(this.STORAGE_EVENTO_KEY, String(id)); } catch {}
  }

  // Obtém o ID do evento canônico (único) reutilizado para todos os posts.
  // Se não existir, cria e persiste o ID para reutilização futura.
  private getOrCreateCanonicalEventoId(): Observable<number> {
    const stored = this.getStoredEventoId();
    if (stored) {
      return of(stored);
    }
    return this.http.get<EventoResponse[]>(`${environment.apiUrl}/api/eventos`, this.getHttpOptions()).pipe(
      switchMap((eventos) => {
        if (Array.isArray(eventos) && eventos.length > 0) {
          // Procura por título canônico (case-insensitive)
          const matches = eventos.filter(e => (e.titulo || '').trim().toLowerCase() === this.CANONICAL_EVENT_TITLE.toLowerCase());
          if (matches.length > 0) {
            const latest = matches.reduce((acc, cur) => (cur.id > acc.id ? cur : acc));
            this.setStoredEventoId(latest.id);
            return of(latest.id);
          }
          // Não há com o título canônico: utilizar o mais recente? Não.
          // Criamos explicitamente o canônico para padronizar.
          return this.criarEventoPadrao();
        }
        // Sem eventos: criar o canônico
        return this.criarEventoPadrao();
      }),
      catchError(() => this.criarEventoPadrao())
    );
  }

  // Obter todos os posts da galeria - TODOS os usuários
  getPosts(): Observable<GaleriaPost[]> {
    console.log('Buscando TODOS os posts da galeria');
    console.log('URL:', `${this.apiUrl}`);
    console.log('Token disponível:', !!this.getToken());

    // Usar diretamente o endpoint geral que retorna TODOS os posts
    return this.http.get<any>(this.apiUrl, this.getHttpOptions())
      .pipe(
        retry(1),
        map(response => {
          console.log('Resposta do backend (todos os posts):', response);
          return Array.isArray(response) ? response.map(post => ({
            id: post.id,
            mensagem: post.mensagem || '',
            urlFoto: post.urlFoto || '',
            urlVideo: post.urlVideo || '',
            dataCriacao: post.dataCriacao,
            eventoId: post.evento?.id || 0,
            usuario: post.usuario ? {
              id: post.usuario.id,
              nome: post.usuario.nome,
              email: post.usuario.email,
              fotoPerfil: post.usuario.fotoPerfil
            } : undefined
          })) : [];
        }),
        catchError(error => {
          console.error('Erro ao buscar todos os posts:', error);
          // Se 500, manter vazio para tela usar fallback local
          return of([] as GaleriaPost[]);
        })
      );
  }

  // Obter posts por evento
  getPostsByEvento(eventoId: number): Observable<GaleriaPost[]> {
    console.log(`Buscando posts para o evento ID: ${eventoId}`);
    return this.http.get<any>(`${this.apiUrl}/evento/${eventoId}`, this.getHttpOptions())
      .pipe(
        retry(2), // Tenta até 2 vezes antes de desistir
        map(response => {
          console.log('Resposta do backend (posts por evento):', response);
          if (Array.isArray(response)) {
            return response.map(post => ({
              id: post.id,
              mensagem: post.mensagem || '',
              urlFoto: post.urlFoto || '',
              urlVideo: post.urlVideo || '',
              dataCriacao: post.dataCriacao,
              eventoId: post.evento?.id || eventoId,
              usuario: post.usuario ? {
                id: post.usuario.id,
                nome: post.usuario.nome,
                email: post.usuario.email,
                fotoPerfil: post.usuario.fotoPerfil
              } : undefined
            }));
          }
          console.error('Resposta inesperada do backend (posts por evento):', response);
          return [];
        }),
        catchError(error => {
          console.error(`Erro ao buscar posts para o evento ${eventoId}:`, error);
          return this.handleError<GaleriaPost[]>('getPostsByEvento', [])(error);
        })
      );
  }

  // Garantir que exista pelo menos um evento válido no sistema
  garantirEventoValido(): Observable<number> {
    console.log('Verificando existência de eventos...');
    const stored = this.getStoredEventoId();
    if (stored) {
      return of(stored);
    }
    return this.http.get<EventoResponse[]>(`${environment.apiUrl}/api/eventos`, this.getHttpOptions())
      .pipe(
        switchMap(eventos => {
          if (Array.isArray(eventos) && eventos.length > 0) {
            const eventoMaisRecente = eventos.reduce((acc, cur) => (cur.id > acc.id ? cur : acc));
            this.setStoredEventoId(eventoMaisRecente.id);
            console.log('Evento válido encontrado (mais recente):', eventoMaisRecente);
            return of(eventoMaisRecente.id);
          }
          console.log('Nenhum evento encontrado. Não criar evento em fluxo de leitura.');
          return throwError(() => new Error('Nenhum evento disponível'));
        }),
        catchError((e) => throwError(() => e))
      );
  }

  // Testar conectividade com o backend
  testConnection(): Observable<boolean> {
    // Teste simples usando o endpoint de galeria sem autenticação primeiro
    console.log('Testando conexão com backend...');
    return this.http.get<any>(`${environment.apiUrl}/api/galeria`, this.getHttpOptionsNoAuth())
      .pipe(
        map(() => {
          console.log('Conexão com backend: OK (sem auth)');
          return true;
        }),
        catchError(error => {
          console.log('Tentativa sem auth falhou, tentando com auth...');
          // Se falhou sem auth, tenta com auth
          return this.http.get<any>(`${environment.apiUrl}/api/galeria`, this.getHttpOptions())
            .pipe(
              map(() => {
                console.log('Conexão com backend: OK (com auth)');
                return true;
              }),
              catchError(authError => {
                console.error('Erro de conectividade com backend:', authError);
                console.log('Status:', authError.status, 'Message:', authError.message);
                // Tratar respostas 4xx/5xx como backend disponível, exceto status 0 (rede)
                if (authError.status === 401 || authError.status === 403) {
                  return of(true);
                }
                if (authError.status >= 500 && authError.status < 600) {
                  return of(true);
                }
                if (authError.status === 0) {
                  return of(false);
                }
                return of(false);
              })
            );
        })
      );
  }

  // Obter o primeiro evento disponível para usar como padrão
  private getDefaultEvento(): Observable<number> {
    console.log('Buscando o primeiro evento disponível');
    const stored = this.getStoredEventoId();
    if (stored) {
      return of(stored);
    }
    return this.http.get<EventoResponse[]>(`${environment.apiUrl}/api/eventos`, this.getHttpOptions())
      .pipe(
        switchMap(eventos => {
          if (eventos && eventos.length > 0) {
            const eventoMaisRecente = eventos.reduce((acc, cur) => (cur.id > acc.id ? cur : acc));
            this.setStoredEventoId(eventoMaisRecente.id);
            return of(eventoMaisRecente.id);
          }
          return throwError(() => new Error('Nenhum evento disponível'));
        }),
        catchError((e) => throwError(() => e))
      );
  }

  // Criar um evento padrão se não existir nenhum
  private criarEventoPadrao(): Observable<number> {
    console.log('Criando evento padrão...');
    const nowIso = new Date().toISOString();
    const eventoDefault = {
      titulo: this.CANONICAL_EVENT_TITLE,
      descricao: 'Evento padrão para compartilhamento de fotos e vídeos',
      dataEvento: nowIso,
      local: 'Online',
      nomeMae: 'Usuário',
      nomePai: 'Memuvie',
      tipoEvento: 'CHA_REVELACAO'
    };
    return this.http.post<any>(`${environment.apiUrl}/api/eventos`, eventoDefault, this.getHttpOptions())
      .pipe(
        map(response => {
          console.log('Evento padrão criado com sucesso:', response);
          this.setStoredEventoId(response.id);
          return response.id;
        }),
        catchError(error => {
          console.error('Erro ao criar evento padrão:', error);
          return throwError(() => new Error('Não foi possível criar um evento padrão'));
        })
      );
  }

  // Criar um novo post
  createPost(post: GaleriaPost): Observable<GaleriaPost> {
    return this.getOrCreateCanonicalEventoId().pipe(
      switchMap((eventoId) => {
        const requestBody: GaleriaPostRequest = {
          mensagem: post.mensagem || '',
          urlFoto: post.urlFoto || '',
          urlVideo: post.urlVideo || '',
          eventoId
        };
        console.log('Enviando post para o backend com evento ID:', eventoId);
        console.log('Dados do post:', requestBody);
        return this.http.post<BackendPost>(this.apiUrl, requestBody, this.getHttpOptions())
          .pipe(
            retry(3),
            delay(1000),
            map(response => ({
              id: response.id,
              mensagem: response.mensagem,
              urlFoto: response.urlFoto,
              urlVideo: response.urlVideo,
              dataCriacao: response.dataCriacao,
              eventoId: response.evento?.id || eventoId,
              usuario: response.usuario ? {
                id: response.usuario.id,
                nome: response.usuario.nome,
                email: response.usuario.email,
                fotoPerfil: response.usuario.fotoPerfil
              } : undefined
            })),
            catchError((error) => {
              console.error('Erro ao criar post:', error);
              if (error.status === 400) {
                console.error('Dados enviados:', requestBody);
                console.error('Erro de validação:', error.error);
              }
              // Se evento foi removido, recria e tenta uma vez
              if (error.status === 404 || (error.error && error.error.message === 'Evento não encontrado')) {
                return this.criarEventoPadrao().pipe(
                  switchMap((novoEventoId) => {
                    const retryBody = { ...requestBody, eventoId: novoEventoId };
                    console.log('Retry com novo evento ID:', novoEventoId);
                    return this.http.post<BackendPost>(this.apiUrl, retryBody, this.getHttpOptions())
                      .pipe(
                        map(response => ({
                          id: response.id,
                          mensagem: response.mensagem,
                          urlFoto: response.urlFoto,
                          urlVideo: response.urlVideo,
                          dataCriacao: response.dataCriacao,
                          eventoId: response.evento?.id || novoEventoId,
                          usuario: response.usuario ? {
                            id: response.usuario.id,
                            nome: response.usuario.nome,
                            email: response.usuario.email,
                            fotoPerfil: response.usuario.fotoPerfil
                          } : undefined
                        }))
                      );
                  })
                );
              }
              return this.handleError<GaleriaPost>('createPost')(error);
            })
          );
      })
    );
  }

  // Atualizar um post existente
  updatePost(id: number, post: GaleriaPost): Observable<GaleriaPost> {
    return this.http.put<GaleriaPost>(`${this.apiUrl}/${id}`, post, this.getHttpOptions())
      .pipe(
        retry(3), // Tenta até 3 vezes
        delay(1000), // Espera 1 segundo entre tentativas
        catchError(this.handleError<GaleriaPost>('updatePost'))
      );
  }

  // Remove um post
  deletePost(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        retry(3), // Tenta até 3 vezes
        delay(1000), // Espera 1 segundo entre tentativas
        catchError(this.handleError<any>('deletePost'))
      );
  }

  // Obter os cabeçalhos HTTP com o token de authentication
  private getHttpOptions() {
    const token = this.getToken();
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Usando token de autorização');
    } else {
      console.warn('Nenhum token encontrado - tentando sem autorização');
    }

    return { headers: new HttpHeaders(headers) };
  }

  // Versão sem autenticação para teste
  private getHttpOptionsNoAuth() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  // Obter o token do localStorage
  private getToken(): string {
    try {
      const sessionStr = localStorage.getItem('session');
      if (!sessionStr) {
        console.warn('Nenhuma sessão encontrada no localStorage');
        return '';
      }

      const session = JSON.parse(sessionStr);
      const token = session.token || '';

      if (!token) {
        console.warn('Token não encontrado na sessão');
      }

      return token;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return '';
    }
  }

  // Tratamento de erros
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      let errorMessage = 'Ocorreu um erro na operação';
      let useDefaultResult = false;

      if (error.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
        // Não usar resultado padrão para erros de autenticação
      } else if (error.status === 500) {
        errorMessage = 'Erro interno no servidor. Tente novamente mais tarde.';
        useDefaultResult = true; // Usar resultado padrão para erro 500
      } else if (error.status === 404) {
        errorMessage = 'Recurso não encontrado.';
        useDefaultResult = true; // Usar resultado padrão para erro 404
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
        useDefaultResult = true; // Usar resultado padrão para outros erros
      }

      // Se um resultado padrão foi fornecido e podemos usá-lo
      if (result !== undefined && useDefaultResult) {
        console.log(`Retornando resultado padrão para ${operation} após erro ${error.status}:`, result);
        return new Observable(subscriber => {
          subscriber.next(result);
          subscriber.complete();
        });
      }

      // Log do erro no console para debugging
      console.warn(`${operation} falhou com status ${error.status}:`, {
        error,
        message: errorMessage,
        defaultResult: result !== undefined ? 'disponível' : 'não fornecido',
        useDefaultResult
      });

      return throwError(() => new Error(errorMessage));
    };
  }
}
