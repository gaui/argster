import { ICommandEvalValueInput } from '../api';
import { IPredicate } from '../api/utils/predicate';

export default class Predicate implements IPredicate {
  private predicates: Array<ICommandEvalValueInput<any, any>>;
  constructor(
    predicates:
      | Array<ICommandEvalValueInput<any, any>>
      | ICommandEvalValueInput<any, any>
  ) {
    if (!predicates) return;

    if (!Array.isArray(predicates)) {
      predicates = [predicates];
    }

    this.predicates = predicates;
  }

  public first(value: any): any | undefined {
    if (!value) return;

    const obj = this.predicates.find(x => x.predicate(value));

    if (!obj) return;

    return obj.replacer(value);
  }

  public all(value: any): any | undefined {
    if (!value) return;

    let newValue: any = value;

    this.predicates.forEach(({ predicate, replacer }) => {
      if (predicate && replacer && predicate(value)) {
        newValue = replacer(newValue);
      }
    });

    return newValue;
  }
}
