export abstract class Pessoa {
  protected readonly id: string;
  protected nome: string;
  protected contato: string;

  protected constructor(id: string, nome: string, contato: string) {
    this.id = id;
    this.nome = nome.trim();
    this.contato = contato.trim();
  }

  public getId(): string {
    return this.id;
  }

  public getNome(): string {
    return this.nome;
  }

  public getContato(): string {
    return this.contato;
  }

  public abstract getResumo(): string;
}
