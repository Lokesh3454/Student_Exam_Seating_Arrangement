import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface UserSession {
  username: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'HOD';
  department?: string;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'HOD';
  department?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<UserSession | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private getStoredUser(): UserSession | null {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user && user.token) {
          return user;
        }
      } catch (e) {
        localStorage.removeItem('currentUser');
        return null;
      }
    }
    return null;
  }

  public get currentUserValue(): UserSession | null {
    return this.currentUserSubject.value;
  }

  public login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: AuthResponse) => {
        const session: UserSession = {
          username: res.username,
          role: res.role,
          department: res.department,
          token: res.token
        };
        localStorage.setItem('currentUser', JSON.stringify(session));
        localStorage.setItem('token', res.token);
        this.currentUserSubject.next(session);
      })
    );
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  public getToken(): string | null {
    return this.currentUserValue?.token || localStorage.getItem('token');
  }

  public getRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  public getDepartment(): string | null {
    return this.currentUserValue?.department || null;
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  public isFaculty(): boolean {
    return this.getRole() === 'FACULTY';
  }

  public isStudent(): boolean {
    return this.getRole() === 'STUDENT';
  }

  public isHod(): boolean {
    return this.getRole() === 'HOD';
  }

  public hasRole(role: string): boolean {
    return this.getRole() === role;
  }

  public hasAnyRole(roles: string[]): boolean {
    const currentRole = this.getRole();
    return !!currentRole && roles.includes(currentRole);
  }
}
