import { Pessoa } from "./Pessoa";
import { texto, type Registro } from "./conversao";

export type TipoParticipacao = "Administrador" | "Responsável" | "Voluntário";

export class Participante extends Pessoa {
  private tipoParticipacao: TipoParticipacao;

  public constructor(id: string, nome: string, contato: string, tipo: TipoParticipacao) {
    super(id, nome, contato);
    this.tipoParticipacao = tipo;
  }

  public static fromRow(row: Registro): Participante {
    return new Participante(
      texto(row["id"]),
      texto(row["nome"]),
      texto(row["contato"]),
      texto(row["tipo_participacao"]) as TipoParticipacao,
    );
  }

  public getTipoParticipacao(): TipoParticipacao {
    return this.tipoParticipacao;
  }

  public override getResumo(): string {
    return `${this.nome} (${this.tipoParticipacao})`;
  }
}
