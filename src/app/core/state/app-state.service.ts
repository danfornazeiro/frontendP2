import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { Cart } from '../models/cart.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { UserProfile } from '../models/user.model';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly productService = inject(ProductService);
  private readonly userService = inject(UserService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);

  private readonly productsSubject = new BehaviorSubject<Product[]>([]);
  private readonly userSubject = new BehaviorSubject<UserProfile | null>(null);
  private readonly cartSubject = new BehaviorSubject<Cart | null>(null);
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);

  readonly products$ = this.productsSubject.asObservable();
  readonly user$ = this.userSubject.asObservable();
  readonly cart$ = this.cartSubject.asObservable();
  readonly orders$ = this.ordersSubject.asObservable();

  loadProducts(force = false): Observable<Product[]> {
    if (!force && this.productsSubject.value.length > 0) {
      return this.products$;
    }

    return this.productService.getAll().pipe(
      tap((products) => this.productsSubject.next(products))
    );
  }

  searchProducts(term: string): Observable<Product[]> {
    if (!term.trim()) {
      return this.products$;
    }

    const normalized = term.trim().toLowerCase();
    return this.products$.pipe(
      map((products) =>
        products.filter((product) => {
          const name = product.nome.toLowerCase();
          const description = product.descricao?.toLowerCase() ?? '';
          return name.includes(normalized) || description.includes(normalized);
        })
      )
    );
  }

  createProduct(payload: Omit<Product, 'id' | 'codigo'>): Observable<Product> {
    return this.productService.create(payload).pipe(
      tap((created) => {
        const next = [...this.productsSubject.value, created];
        this.productsSubject.next(next);
      })
    );
  }

  updateProduct(product: Product): Observable<Product> {
    return this.productService.update(product).pipe(
      tap((updated) => {
        const id = this.resolveProductId(updated);
        const next = this.productsSubject.value.map((item) =>
          this.resolveProductId(item) === id ? updated : item
        );
        this.productsSubject.next(next);
      })
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.productService.remove(id).pipe(
      tap(() => {
        const next = this.productsSubject.value.filter(
          (item) => this.resolveProductId(item) !== id
        );
        this.productsSubject.next(next);
      })
    );
  }

  login(email: string, senha: string): Observable<UserProfile | null> {
    return this.userService.getAll().pipe(
      map(
        (users) =>
          users.find((user) => user.email === email && (!user.senha || user.senha === senha)) ?? null
      ),
      switchMap((user) => {
        if (!user) {
          return of(null);
        }

        const id = this.resolveUserId(user);
        localStorage.setItem('clientId', id.toString());

        if (!user.cesta?.id) {
          return this.getUserFromListById(id).pipe(
            tap((fullUser) => {
              if (!fullUser) {
                return;
              }
              this.syncCartIdFromUser(fullUser, true);
              this.syncOrdersFromUser(fullUser);
              this.storeUserSnapshot(fullUser);
              this.userSubject.next(fullUser);
            }),
            map((fullUser) => fullUser ?? user)
          );
        }

        this.syncCartIdFromUser(user, true);
        this.syncOrdersFromUser(user);
        this.storeUserSnapshot(user);
        this.userSubject.next(user);
        return of(user);
      })
    );
  }

  restoreUserFromStorage(): Observable<UserProfile | null> {
    const storedId = localStorage.getItem('clientId');
    if (!storedId) {
      this.userSubject.next(null);
      this.ordersSubject.next([]);
      return of(null);
    }

    const cached = this.getUserSnapshot();
    if (cached) {
      this.userSubject.next(cached);
      this.syncCartIdFromUser(cached, true);
      this.syncOrdersFromUser(cached);
    } else {
      this.syncCartIdFromUser(null, true);
      this.ordersSubject.next([]);
    }

    return this.getUserFromListById(Number(storedId)).pipe(
      tap((user) => {
        if (!user) {
          return;
        }
        this.syncCartIdFromUser(user, true);
        this.syncOrdersFromUser(user);
        this.storeUserSnapshot(user);
        this.userSubject.next(user);
      }),
      map((user) => user ?? this.userSubject.value),
      catchError(() => of(this.userSubject.value))
    );
  }

  refreshCurrentUser(): Observable<UserProfile | null> {
    const clientId = this.getClientId();
    if (!clientId) {
      this.userSubject.next(null);
      return of(null);
    }

    return this.getUserFromListById(clientId).pipe(
      tap((user) => {
        if (!user) {
          return;
        }
        this.syncCartIdFromUser(user, true);
        this.syncOrdersFromUser(user);
        this.storeUserSnapshot(user);
        this.userSubject.next(user);
      }),
      map((user) => user ?? this.userSubject.value),
      catchError(() => of(this.userSubject.value))
    );
  }

  logout(): void {
    localStorage.removeItem('clientId');
    localStorage.removeItem('cartId');
    localStorage.removeItem('userSnapshot');
    this.userSubject.next(null);
    this.cartSubject.next(null);
    this.ordersSubject.next([]);
  }

  getClientId(): number | null {
    const stored = localStorage.getItem('clientId');
    return stored ? Number(stored) : null;
  }

  getCartId(): string | null {
    const stored = localStorage.getItem('cartId');
    if (!stored) {
      return null;
    }

    return this.isValidUuid(stored) ? stored : null;
  }

  ensureCartId$(): Observable<string | null> {
    const stored = this.getCartId();
    if (stored) {
      return of(stored);
    }

    const clientId = this.getClientId();
    if (!clientId) {
      return of(null);
    }

    return this.getUserFromListById(clientId).pipe(
      tap((user) => {
        if (!user) {
          return;
        }
        this.syncCartIdFromUser(user, true);
        this.storeUserSnapshot(user);
        this.userSubject.next(user);
      }),
      map((user) => user?.cesta?.id ?? null),
      catchError(() => of(null))
    );
  }

  setCartId(id: string): void {
    localStorage.setItem('cartId', id);
  }

  updateProfile(payload: Partial<UserProfile>): Observable<UserProfile> {
    const currentUser = this.userSubject.value ?? this.getUserSnapshot();
    const id = payload.id ?? payload.codigo ?? this.resolveUserId(currentUser);
    const mergedProfile = {
      ...currentUser,
      ...payload,
      id,
      codigo: id,
    } satisfies Partial<UserProfile> & { id: number; codigo: number };

    return this.userService.update(mergedProfile).pipe(
      tap(() => {
        const nextUser = mergedProfile as UserProfile;
        this.storeUserSnapshot(nextUser);
        this.userSubject.next(nextUser);
      }),
      map(() => mergedProfile as UserProfile)
    );
  }

  createUser(payload: Omit<UserProfile, 'id' | 'codigo'>): Observable<UserProfile> {
    return this.userService.create(payload).pipe(
      switchMap((created) => {
        const id = this.resolveUserId(created);
        localStorage.setItem('clientId', id.toString());

        if (!created.cesta?.id) {
          return this.getUserFromListById(id).pipe(
            tap((fullUser) => {
              if (!fullUser) {
                return;
              }
              this.syncCartIdFromUser(fullUser, true);
              this.syncOrdersFromUser(fullUser);
              this.storeUserSnapshot(fullUser);
              this.userSubject.next(fullUser);
            }),
            map((fullUser) => fullUser ?? created)
          );
        }

        this.syncCartIdFromUser(created, true);
        this.syncOrdersFromUser(created);
        this.storeUserSnapshot(created);
        this.userSubject.next(created);
        return of(created);
      })
    );
  }

  changePassword(id: number, senha: string): Observable<void> {
    return this.userService.changePassword(id, { senha });
  }

  loadCart(carrinhoId: string): Observable<Cart> {
    return this.cartService.getById(carrinhoId).pipe(
      map((cart) => this.normalizeCart(cart)),
      tap((cart) => this.cartSubject.next(cart))
    );
  }

  addToCart(clienteId: number, carrinhoId: string, produtoId: number[]): Observable<Cart> {
    return this.cartService.addItems(clienteId, carrinhoId, produtoId).pipe(
      map((cart) => this.normalizeCart(cart)),
      tap((cart) => {
        this.cartSubject.next(cart);
        this.loadProducts(true).subscribe();
      })
    );
  }

  removeFromCart(clienteId: number | null, carrinhoId: string, produtoId: number): Observable<Cart> {
    return this.cartService.removeItem(carrinhoId, produtoId).pipe(
      map((cart) => this.normalizeCart(cart)),
      tap((cart) => {
        this.cartSubject.next(cart);
        this.loadProducts(true).subscribe();
      }),
      catchError(() => of(this.cartSubject.value ?? ({ id: '', clienteId: clienteId ?? 0, produtoId: [] } as Cart)))
    );
  }

  removeFromCartLocal(produtoId: number): void {
    const current = this.cartSubject.value;
    if (!current) {
      return;
    }

    const next = {
      ...current,
      produtoId: (current.produtoId ?? []).filter((id) => id !== produtoId),
    };

    this.cartSubject.next(next);
  }

  clearCartLocal(): void {
    this.cartSubject.next(null);
  }

  createOrder(carrinhoId: string): Observable<Order> {
    return this.orderService.create(carrinhoId).pipe(
      tap((order) => {
        this.ordersSubject.next([...this.ordersSubject.value, this.normalizeOrder(order)]);
        this.loadProducts(true).subscribe();
      })
    );
  }

  private syncOrdersFromUser(user: UserProfile | null): void {
    const orders = user?.pedido ?? [];
    this.ordersSubject.next(orders.map((order) => this.normalizeOrder(order)));
  }

  private syncCartIdFromUser(user: UserProfile | null, force: boolean): void {
    const cartId = user?.cesta?.id;
    if (cartId) {
      localStorage.setItem('cartId', cartId);
      return;
    }

    if (force || !this.isValidUuid(localStorage.getItem('cartId') ?? '')) {
      localStorage.removeItem('cartId');
    }
  }

  private isValidUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  }

  private storeUserSnapshot(user: UserProfile): void {
    const snapshot = {
      id: user.id,
      codigo: user.codigo,
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      logradouro: user.logradouro,
      cesta: user.cesta,
    } satisfies Partial<UserProfile>;

    localStorage.setItem('userSnapshot', JSON.stringify(snapshot));
  }

  private getUserSnapshot(): UserProfile | null {
    const raw = localStorage.getItem('userSnapshot');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }

  cancelOrder(orderId: number): Observable<void> {
    return this.orderService.cancel(orderId).pipe(
      tap(() => {
        const next = this.ordersSubject.value.filter((order) => order.id !== orderId);
        this.ordersSubject.next(next);
      })
    );
  }

  private normalizeOrder(order: Order): Order {
    const carrinhoId =
      typeof order.carrinhoId === 'string' || typeof order.carrinhoId === 'number'
        ? order.carrinhoId
        : order.carrinho?.id ?? '';

    return {
      ...order,
      carrinhoId,
      carrinho: order.carrinho ?? (typeof carrinhoId === 'string' ? { id: carrinhoId } : undefined),
    };
  }

  private resolveProductId(product?: Product | null): number {
    if (!product) {
      return 0;
    }

    return product.id ?? product.codigo ?? 0;
  }

  private normalizeCart(cart: Cart): Cart {
    if (cart.produtoId && cart.produtoId.length > 0) {
      return cart;
    }

    if (!cart.produtos || cart.produtos.length === 0) {
      return { ...cart, produtoId: [] };
    }

    const ids = cart.produtos
      .map((item) => (typeof item === 'number' ? item : this.resolveProductId(item)))
      .filter((id) => id > 0);

    return { ...cart, produtoId: ids };
  }

  private resolveUserId(user?: UserProfile | null): number {
    if (!user) {
      return 0;
    }

    return user.id ?? user.codigo ?? 0;
  }

  private getUserFromListById(id: number): Observable<UserProfile | null> {
    return this.userService.getAll().pipe(
      map((users) => users.find((user) => this.resolveUserId(user) === id) ?? null)
    );
  }
}
