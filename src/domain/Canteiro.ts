import { Plantio } from "./Plantio";
import { numero, texto, type Registro } from "./conversao";

export type StatusCanteiro = "Ativo" | "Em preparo" | "Em colheita" | "Inativo";

export class Canteiro {
  private readonly id: string;
  private identificacao: string;
  private localizacao: string;
  private tamanhoM2: number;
  private status: StatusCanteiro;
  private readonly plantios: Plantio[] = [];

  public constructor(
    id: string,
    identificacao: string,
    localizacao: string,
    tamanhoM2: number,
    status: StatusCanteiro,
  ) {
    this.id = id;
    this.identificacao = identificacao;
    this.localizacao = localizacao;
    this.tamanhoM2 = tamanhoM2;
    this.status = status;
  }

  public static fromRow(row: Registro): Canteiro {
    return new Canteiro(
      texto(row["id"]),
      texto(row["identificacao"]),
      texto(row["localizacao"]),
      numero(row["tamanho_m2"]),
      texto(row["status"]) as StatusCanteiro,
    );
  }

  public getId(): string {
    return this.id;
  }

  public getIdentificacao(): string {
    return this.identificacao;
  }

  public getLocalizacao(): string {
    return this.localizacao;
  }

  public getTamanhoM2(): number {
    return this.tamanhoM2;
  }

  public getStatus(): StatusCanteiro {
    return this.status;
  }

  public estaAtivo(): boolean {
    return this.status === "Ativo";
  }

  public adicionarPlantio(plantio: Plantio): void {
    if (plantio.getCanteiroId() !== this.id) {
      throw new Error("O plantio pertence a outro canteiro.");
    }
    this.plantios.push(plantio);
  }

  public getPlantios(): readonly Plantio[] {
    return this.plantios;
  }
}
