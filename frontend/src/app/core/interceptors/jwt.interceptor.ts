import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Attach Bearer token if present and request is for our API
  let authReq = req;
  if (token && !req.url.includes('/api/auth/login')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If JWT is invalid or expired (401), session must be cleared
      if (error.status === 401) {
        if (!router.url.includes('/login')) {
          console.warn('Session expired or invalid token. Redirecting to login.');
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
