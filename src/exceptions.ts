class VariableUnresolvableException extends Error {
  public variable: string;
  public original: string;
  public argument: string;
  constructor(obj: any) {
    super(obj.variable);

    this.variable = obj.variable;
    this.original = obj.original;
    this.argument = obj.argument;
  }

  public toString() {
    return `Variable ${this.original} was not resolved`;
  }
}

export { VariableUnresolvableException };
