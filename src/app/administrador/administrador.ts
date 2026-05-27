import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Cliente } from '../model/cliente/cliente';
import { Produto } from '../model/produto/produto';
import { ClienteService } from '../service/cliente.service';
import { ProdutoService } from '../service/produto.service';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administrador.html',
  styleUrl: './administrador.css',
})
export class Administrador implements OnInit {
  clientes: Cliente[] = [];
  produtos: Produto[] = [];

  clienteForm: Cliente = this.criarClienteVazio();
  produtoForm: Produto = this.criarProdutoVazio();

  clienteMensagem = '';
  produtoMensagem = '';
  carregandoClientes = false;
  carregandoProdutos = false;

  constructor(
    private readonly clienteService: ClienteService,
    private readonly produtoService: ProdutoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
    this.carregarProdutos();
  }

  carregarClientes(): void {
    this.carregandoClientes = true;
    this.clienteService.listar().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.carregandoClientes = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregandoClientes = false;
        this.clienteMensagem = 'Não foi possível carregar os clientes.';
        this.cdr.detectChanges();
      },
    });
  }

  carregarProdutos(): void {
    this.carregandoProdutos = true;
    this.produtoService.listar().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.carregandoProdutos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregandoProdutos = false;
        this.produtoMensagem = 'Não foi possível carregar os produtos.';
        this.cdr.detectChanges();
      },
    });
  }

  selecionarCliente(cliente: Cliente): void {
    this.clienteForm = { ...cliente };
    this.clienteMensagem = '';
  }

  novoCliente(): void {
    this.clienteForm = this.criarClienteVazio();
  }

  salvarCliente(): void {
    const editando = this.clienteForm.codigo > 0;
    const operacao = editando
      ? this.clienteService.atualizar(this.clienteForm)
      : this.clienteService.criar(this.clienteForm);

    operacao.subscribe({
      next: () => {
        this.clienteMensagem = editando
          ? 'Cliente atualizado com sucesso.'
          : 'Cliente criado com sucesso.';
        this.novoCliente();
        this.carregarClientes();
      },
      error: () => {
        this.clienteMensagem = 'Falha ao salvar o cliente.';
      },
    });
  }

  deletarCliente(codigo: number): void {
    if (!confirm(`Excluir o cliente ${codigo}?`)) {
      return;
    }

    this.clienteService.excluir(codigo).subscribe({
      next: () => this.carregarClientes(),
      error: () => {
        this.clienteMensagem = 'Falha ao excluir o cliente.';
      },
    });
  }

  selecionarProduto(produto: Produto): void {
    this.produtoForm = { ...produto };
    this.produtoMensagem = '';
  }

  novoProduto(): void {
    this.produtoForm = this.criarProdutoVazio();
  }

  salvarProduto(): void {
    const editando = this.produtoForm.codigo > 0;
    const operacao = editando
      ? this.produtoService.atualizar(this.produtoForm)
      : this.produtoService.criar(this.produtoForm);

    operacao.subscribe({
      next: () => {
        this.produtoMensagem = editando
          ? 'Produto atualizado com sucesso.'
          : 'Produto criado com sucesso.';
        this.novoProduto();
        this.carregarProdutos();
      },
      error: () => {
        this.produtoMensagem = 'Falha ao salvar o produto.';
      },
    });
  }

  deletarProduto(codigo: number): void {
    if (!confirm(`Excluir o produto ${codigo}?`)) {
      return;
    }

    this.produtoService.excluir(codigo).subscribe({
      next: () => this.carregarProdutos(),
      error: () => {
        this.produtoMensagem = 'Falha ao excluir o produto.';
      },
    });
  }

  private criarClienteVazio(): Cliente {
    return new Cliente();
  }

  private criarProdutoVazio(): Produto {
    return new Produto();
  }
}
