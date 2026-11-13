import { RegraDeNegocioError } from "./RegraDeNegocioError";
import { numero, texto, TOLERANCIA_KG, type Registro } from "./conversao";

export const TIPOS_DESTINO = [
  "Feira",
  "Prefeitura (licitação)",
  "Doação",
  "Cozinha comunitária",
  "Banco de alimentos",
  "Consumo dos participantes",
  "Venda solidária",
] as const;

export class Destinacao {
  private readonly id: string;
  private tipoDestino: string;
  private quantidadeKg: number;
  private data: string;

  public constructor(id: string, tipoDestino: string, quantidadeKg: number, data: string) {
    this.id = id;
    this.tipoDestino = tipoDestino;
    this.quantidadeKg = quantidadeKg;
    this.data = data;
  }

  public static fromRow(row: Registro): Destinacao {
    return new Destinacao(
      texto(row["id"]),
      texto(row["tipo_destino"]),
      numero(row["quantidade_kg"]),
      texto(row["data"]),
    );
  }

  public getId(): string {
    return this.id;
  }

  public getTipoDestino(): string {
    return this.tipoDestino;
  }

  public getQuantidadeKg(): number {
    return this.quantidadeKg;
  }

  public getData(): string {
    return this.data;
  }

  public temDestino(): boolean {
    return this.tipoDestino.trim() !== "";
  }

  public temQuantidadeValida(): boolean {
    return this.quantidadeKg > 0;
  }

  public verificarCampos(): void {
    if (!this.temDestino()) {
      throw new RegraDeNegocioError("Escolha para onde foi a colheita.");
    }
    if (!this.temQuantidadeValida()) {
      throw new RegraDeNegocioError("A quantidade destinada deve ser maior que zero.");
    }
  }

  public validarContraColheita(disponivel: number): boolean {
    return this.quantidadeKg <= disponivel + TOLERANCIA_KG;
  }
}
