export class Mensaje {
    texto: string = '';
    fecha: Date;
    usuario: string = ''
    tipo: string = '';
    color: string ='';

    constructor() { 
        this.fecha = new Date;
    }    
}
