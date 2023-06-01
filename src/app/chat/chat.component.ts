import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

import { Mensaje } from './models/mensaje';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private cliente: Client;
  public conectado: boolean = false;
  public mensaje: Mensaje = new Mensaje();
  public mensajes: Mensaje[] = [];
  public escribiendo: string = '';


  constructor() { 
    this.cliente = new Client();
  }

  ngOnInit(): void {
    this.cliente.webSocketFactory = () => { 
      return new SockJS("http://172.30.114.44:9090/chat-websocket"); 
    }

    this.cliente.onConnect = (frame) => {
      this.conectado = true;
      console.log('Conectados: ' + this.cliente.commit + ' : ' + frame);

      this.cliente.subscribe('/chat/mensaje', e => {
        let mensaje = JSON.parse( e.body ) as Mensaje;
        mensaje.fecha = new Date(mensaje.fecha);

        if(!this.mensaje.color && mensaje.tipo == 'NUEVO_USUARIO' && this.mensaje.usuario == mensaje.usuario){
          this.mensaje.color = mensaje.color;
        }

        this.mensajes.push(mensaje);

        console.log(mensaje);
      });

      this.cliente.subscribe('/chat/escribiendo', e => {
        this.escribiendo = e.body;
        setTimeout(() => { this.escribiendo = ''; }, 3000);
      });      

      this.mensaje.tipo = 'NUEVO_USUARIO';
      this.cliente.publish({destination: '/app/mensaje', body: JSON.stringify(this.mensaje)});

    }

    this.cliente.onDisconnect = (frame) => {
      this.conectado = false;
      console.log('Desconectados: ' + !this.cliente.commit + ' : ' + frame);
    }    

  }

  conectar(): void{
    this.cliente.activate();
  }

  desconectar(): void{
    this.cliente.deactivate();
  }

  enviarMensaje(): void{
    this.mensaje.tipo = 'MENSAJE';
    this.cliente.publish({destination: '/app/mensaje', body: JSON.stringify(this.mensaje)});
    this.mensaje.texto = '';
  }

  escribndo(): void{
    this.cliente.publish({destination: '/app/escribiendo', body: this.mensaje.usuario });
  }

}
