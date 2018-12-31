import { ITransform, ITransformer } from './api/transformer';

// tslint:disable no-shadowed-variable

class Transformer implements ITransformer {
  private _transformers: Array<ITransform<any, any>>;

  constructor(transformers: Array<ITransform<any, any>>) {
    this._transformers = transformers;
  }

  public append(transformers: Array<ITransform<any, any>>) {
    this._transformers = this._transformers.concat(transformers);
  }

  public all(subject: any): any {
    return this.run(subject);
  }

  public single(subject: any, transformerName: string): any {
    const transformer = this.getByName(transformerName);
    if (!transformer) return subject;
    return transformer.replacer(subject);
  }

  public first(subject: any): any | undefined {
    const match = this.getByPredicate(subject);
    if (!match) return subject;
    else return match.replacer(subject);
  }

  private getByName = (
    transformerName: string
  ): ITransform<any, any> | undefined =>
    this._transformers.find(x => x.name === transformerName);

  private getByPredicate = (subject: any): ITransform<any, any> | undefined =>
    this._transformers.find(x => x.predicate(subject));

  private run = (subject: any) =>
    this._transformers.reduce((acc: any, f: ITransform<any, any>) => {
      if (f.predicate(acc)) return f.replacer(acc);
      else return subject;
    }, subject);
}

const transformers = {
  defaults: [
    {
      name: 'sentencesInQuotes',
      predicate: (val: string): boolean => {
        if (!val) return false;
        return val.split(' ').length > 1;
      },
      replacer: (val: string): string => `"${val}"`
    }
  ],
  dynamicVar: [
    {
      predicate: (val: () => string) => val instanceof Function,
      replacer: (val: () => string) => val()
    },
    {
      predicate: (val: string) => typeof val === 'string',
      replacer: (val: string) => val
    }
  ]
};

export { Transformer, transformers };
