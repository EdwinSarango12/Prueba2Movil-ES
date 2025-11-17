import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash.module').then(m => m.SplashPageModule)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./pages/onboarding/onboarding.module').then(m => m.OnboardingPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then(m => m.RegistroPageModule)
  },
  {
    path: 'catalogo',
    loadChildren: () => import('./pages/catalogo/catalogo.module').then(m => m.CatalogoPageModule)
  },
  {
    path: 'plan-detalle/:id',
    loadChildren: () => import('./pages/plan-detalle/plan-detalle.module').then(m => m.PlanDetallePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mis-contrataciones',
    loadChildren: () => import('./pages/mis-contrataciones/mis-contrataciones.module').then(m => m.MisContratacionesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'chat/:id',
    loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then(m => m.PerfilPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'asesor',
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/asesor/dashboard/dashboard.module').then(m => m.DashboardPageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'asesor_comercial' }
      },
      {
        path: 'plan-form',
        loadChildren: () => import('./pages/asesor/plan-form/plan-form.module').then(m => m.PlanFormPageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'asesor_comercial' }
      },
      {
        path: 'plan-form/:id',
        loadChildren: () => import('./pages/asesor/plan-form/plan-form.module').then(m => m.PlanFormPageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'asesor_comercial' }
      },
      {
        path: 'contrataciones',
        loadChildren: () => import('./pages/asesor/contrataciones/contrataciones.module').then(m => m.ContratacionesPageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'asesor_comercial' }
      },
      {
        path: 'chat/:id',
        loadChildren: () => import('./pages/asesor/chat/chat.module').then(m => m.ChatPageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'asesor_comercial' }
      }
    ]
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
