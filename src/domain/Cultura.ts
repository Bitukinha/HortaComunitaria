import { numero, texto, type Registro } from "./conversao";

export class Cultura {
  private readonly id: string;
  private nome: string;
  private categoria: string;
  private periodoCultivoDias: number;

  public constructor(id: string, nome: string, categoria: string, periodoCultivoDias: number) {
    this.id = id;
    this.nome = nome;
    this.categoria = categoria;
    this.periodoCultivoDias = periodoCultivoDias;
  }

  public static fromRow(row: Registro): Cultura {
    return new Cultura(
      texto(row["id"]),
      texto(row["nome"]),
      texto(row["categoria"]),
      numero(row["periodo_cultivo_dias"]),
    );
  }

  public getId(): string {
    return this.id;
  }

  public getNome(): string {
    return this.nome;
  }

  public getCategoria(): string {
    return this.categoria;
  }

  public getPeriodoCultivoDias(): number {
    return this.periodoCultivoDias;
  }
}
