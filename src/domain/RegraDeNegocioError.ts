export class RegraDeNegocioError extends Error {
  public constructor(mensagem: string) {
    super(mensagem);
    this.name = "RegraDeNegocioError";
  }

  public override toString(): string {
    return this.message;
  }
}
