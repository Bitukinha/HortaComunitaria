import { Destinacao } from "./Destinacao";
import { RegistroProdutivo } from "./RegistroProdutivo";
import { RegraDeNegocioError } from "./RegraDeNegocioError";
import { formatarKg, numero, texto, TOLERANCIA_KG, type Registro } from "./conversao";

export class Colheita extends RegistroProdutivo {
  public static readonly ROTULO_INDICADOR = "Total colhido (kg)";

  private plantioId: string;
  private quantidadeKg: number;
  private readonly destinacoes: Destinacao[] = [];

  public constructor(id: string, plantioId: string, data: string, quantidadeKg: number) {
    super(id, data);
    this.plantioId = plantioId;
    this.quantidadeKg = quantidadeKg;
  }

  public static fromRow(row: Registro, destinacoes: Registro[] = []): Colheita {
    const colheita = new Colheita(
      texto(row["id"]),
      texto(row["plantio_id"]),
      texto(row["data"]),
      numero(row["quantidade_kg"]),
    );
    destinacoes
      .filter((d) => texto(d["colheita_id"]) === colheita.getId())
      .forEach((d) => colheita.destinacoes.push(Destinacao.fromRow(d)));
    return colheita;
  }

  public getPlantioId(): string {
    return this.plantioId;
  }

  public getQuantidadeKg(): number {
    return this.quantidadeKg;
  }

  public getDestinacoes(): readonly Destinacao[] {
    return this.destinacoes;
  }

  public getTotalDestinado(ignorarId?: string): number {
    return this.destinacoes
      .filter((d) => d.getId() !== ignorarId)
      .reduce((total, d) => total + d.getQuantidadeKg(), 0);
  }

  public getSaldoDisponivel(ignorarId?: string): number {
    return this.quantidadeKg - this.getTotalDestinado(ignorarId);
  }

  public estaTotalmenteDestinada(ignorarId?: string): boolean {
    return this.getSaldoDisponivel(ignorarId) <= TOLERANCIA_KG;
  }

  public verificarDestinacao(destinacao: Destinacao, editando: boolean): void {
    destinacao.verificarCampos();
    const ignorarId = editando ? destinacao.getId() : undefined;
    const disponivel = this.getSaldoDisponivel(ignorarId);
    if (destinacao.validarContraColheita(disponivel)) return;

    if (editando) {
      throw new RegraDeNegocioError(
        `Com essa alteração, o total destinado passaria do colhido (${formatarKg(this.quantidadeKg)} kg).`,
      );
    }
    if (this.estaTotalmenteDestinada()) {
      throw new RegraDeNegocioError("Esta colheita já foi totalmente destinada.");
    }
    throw new RegraDeNegocioError(
      `Quantidade maior que o disponível desta colheita (${formatarKg(disponivel)} kg).`,
    );
  }

  public adicionarDestinacao(destinacao: Destinacao): void {
    this.verificarDestinacao(destinacao, false);
    this.destinacoes.push(destinacao);
  }

  public verificarNovaQuantidade(novaQuantidadeKg: number): void {
    const destinado = this.getTotalDestinado();
    if (novaQuantidadeKg + TOLERANCIA_KG < destinado) {
      throw new RegraDeNegocioError(
        `Esta colheita já tem ${formatarKg(destinado)} kg destinados; a quantidade não pode ficar abaixo disso.`,
      );
    }
  }

  public override calcularIndicador(): number {
    return this.quantidadeKg;
  }

  public override getRotuloIndicador(): string {
    return Colheita.ROTULO_INDICADOR;
  }
}
