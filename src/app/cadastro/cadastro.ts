import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Cliente } from '../model/cliente/cliente';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  mensagem: string = '';

  obj: Cliente = new Cliente();

  gravar() {
    const json = JSON.stringify(this.obj);
    localStorage.setItem('meu cliente', json);
    this.mensagem = 'Cliente gravado com sucesso.';
  }
}
