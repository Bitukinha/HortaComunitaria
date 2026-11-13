import { Colheita } from "./Colheita";
import { RegistroProdutivo } from "./RegistroProdutivo";
import { numero, texto, type Registro } from "./conversao";

export class Plantio extends RegistroProdutivo {
  public static readonly ROTULO_INDICADOR = "Mudas/sementes plantadas";

  private canteiroId: string;
  private culturaId: string;
  private quantidade: number;
  private observacao: string;
  private readonly colheitas: Colheita[] = [];

  public constructor(
    id: string,
    canteiroId: string,
    culturaId: string,
    dataPlantio: string,
    quantidade: number,
    observacao: string,
  ) {
    super(id, dataPlantio);
    this.canteiroId = canteiroId;
    this.culturaId = culturaId;
    this.quantidade = quantidade;
    this.observacao = observacao;
  }

  public static fromRow(row: Registro): Plantio {
    return new Plantio(
      texto(row["id"]),
      texto(row["canteiro_id"]),
      texto(row["cultura_id"]),
      texto(row["data_plantio"]),
      numero(row["quantidade"]),
      texto(row["observacao"]),
    );
  }

  public getCanteiroId(): string {
    return this.canteiroId;
  }

  public getCulturaId(): string {
    return this.culturaId;
  }

  public getObservacao(): string {
    return this.observacao;
  }

  public adicionarColheita(colheita: Colheita): void {
    this.colheitas.push(colheita);
  }

  public getColheitas(): readonly Colheita[] {
    return this.colheitas;
  }

  public override calcularIndicador(): number {
    return this.quantidade;
  }

  public override getRotuloIndicador(): string {
    return Plantio.ROTULO_INDICADOR;
  }
}
