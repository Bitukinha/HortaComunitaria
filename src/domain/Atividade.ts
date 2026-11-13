import { texto, type Registro } from "./conversao";

export class Atividade {
  private readonly id: string;
  private tipo: string;
  private data: string;
  private canteiroId: string;
  private participanteId: string;
  private descricao: string;

  public constructor(
    id: string,
    tipo: string,
    data: string,
    canteiroId: string,
    participanteId: string,
    descricao: string,
  ) {
    this.id = id;
    this.tipo = tipo;
    this.data = data;
    this.canteiroId = canteiroId;
    this.participanteId = participanteId;
    this.descricao = descricao;
  }

  public static fromRow(row: Registro): Atividade {
    return new Atividade(
      texto(row["id"]),
      texto(row["tipo"]),
      texto(row["data"]),
      texto(row["canteiro_id"]),
      texto(row["participante_id"]),
      texto(row["descricao"]),
    );
  }

  public getId(): string {
    return this.id;
  }

  public getTipo(): string {
    return this.tipo;
  }

  public getData(): string {
    return this.data;
  }

  public getCanteiroId(): string {
    return this.canteiroId;
  }

  public getParticipanteId(): string {
    return this.participanteId;
  }

  public getDescricao(): string {
    return this.descricao;
  }
}
