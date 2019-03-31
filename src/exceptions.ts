class VariableUnresolvableException extends Error {
  public variable: string;
  public original: string;
  public argument: string;
  public constructor(obj: { [key: string]: string }) {
    super(obj.variable);

    this.variable = obj.variable;
    this.original = obj.original;
    this.argument = obj.argument;
  }

  public toString(): string {
    return `Variable ${this.original} was not resolved`;
  }
}

export { VariableUnresolvableException };
