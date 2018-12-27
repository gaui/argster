export interface IPredicate {
  first(value: any): any | undefined;
  all(value: any): any | undefined;
}
