import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/product/product.page').then((m) => m.ProductPage),
  },
  {
    path: 'create-product',
    loadComponent: () =>
      import('./features/admin-product/admin-product.page').then((m) => m.AdminProductPage),
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./features/profile/edit-profile.page').then((m) => m.EditProfilePage),
  },
  {
    path: 'create-profile',
    loadComponent: () =>
      import('./features/profile/create-profile.page').then((m) => m.CreateProfilePage),
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/orders.page').then((m) => m.OrdersPage),
  },
  { path: '**', redirectTo: '/home' },
];
