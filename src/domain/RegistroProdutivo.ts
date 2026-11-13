export abstract class RegistroProdutivo {
  protected readonly id: string;
  protected data: string;

  protected constructor(id: string, data: string) {
    this.id = id;
    this.data = data;
  }

  public getId(): string {
    return this.id;
  }

  public getData(): string {
    return this.data;
  }

  public abstract calcularIndicador(): number;

  public abstract getRotuloIndicador(): string;

  public static somarIndicadores(registros: readonly RegistroProdutivo[]): Map<string, number> {
    const totais = new Map<string, number>();
    for (const registro of registros) {
      const rotulo = registro.getRotuloIndicador();
      totais.set(rotulo, (totais.get(rotulo) ?? 0) + registro.calcularIndicador());
    }
    return totais;
  }
}
