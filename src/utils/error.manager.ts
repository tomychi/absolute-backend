import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorManager extends Error {
  // me da todas las key que tiene el enum de HtppStatus
  constructor({
    type,
    message,
  }: {
    type: keyof typeof HttpStatus;
    message: string;
  }) {
    super(`${type} :: ${message}`);
  }

  // 'static' NO HACE FALTA instanciar la clase para llamar esta funcion
  public static createSignatureError(message: string) {
    const name = message.split(' :: ')[0];
    if (name) {
      throw new HttpException(message, HttpStatus[name]);
    } else {
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
