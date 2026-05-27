import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { DetalheProduto } from '../detalhe-produto/detalhe-produto';
import { Produto } from '../model/produto/produto';
import { ProdutoService } from '../service/produto.service';

@Component({
  selector: 'app-vitrine-api',
  standalone: true,
  imports: [CommonModule, DetalheProduto],
  templateUrl: './vitrine-api.html',
  styleUrl: './vitrine-api.css',
})
export class VitrineApi implements OnInit {
  listaProdutos: Produto[] = [];
  produtoSelecionado: Produto | null = null;
  carregando = false;
  mensagem = '';

  constructor(
    private readonly produtoService: ProdutoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregando = true;
    this.mensagem = '';

    this.produtoService.listar().subscribe({
      next: (produtos) => {
        this.listaProdutos = produtos;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.mensagem = 'Não foi possível carregar os produtos do servidor.';
        this.cdr.detectChanges();
      },
    });
  }

  abrirDetalhe(produto: Produto): void {
    this.produtoSelecionado = produto;
  }

  fecharDetalhe(): void {
    this.produtoSelecionado = null;
  }

  comprarProdutoSelecionado(): void {
    if (!this.produtoSelecionado) {
      return;
    }

    this.comprarItem(this.produtoSelecionado);
  }

  comprarItem(produto: Produto): void {
    if (produto.quantidade <= 0) {
      return;
    }

    const atualizado = {
      ...produto,
      quantidade: produto.quantidade - 1,
    };

    this.produtoService.atualizar(atualizado).subscribe({
      next: () => {
        this.carregarProdutos();
        this.fecharDetalhe();
      },
      error: () => {
        this.mensagem = 'Não foi possível atualizar o estoque.';
      },
    });
  }

  getPreco(produto: Produto): number {
    return produto.promo > 0 && produto.promo < produto.valor ? produto.promo : produto.valor;
  }
}
