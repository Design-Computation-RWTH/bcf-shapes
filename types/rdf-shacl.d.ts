/**
 * Minimal declarations for the RDF/JS and SHACL packages that ship no types.
 *
 * Only the surface this package actually uses is declared. A wider guess would
 * be more likely to drift from the real behaviour than to help.
 */

declare module "@rdfjs/dataset" {
  interface RdfJsQuad {
    subject: unknown;
    predicate: unknown;
    object: { value: string };
  }
  interface RdfJsDataset {
    readonly size: number;
    [Symbol.iterator](): Iterator<RdfJsQuad>;
    add(quad: unknown): RdfJsDataset;
    match(
      subject?: unknown,
      predicate?: unknown,
      object?: unknown,
    ): RdfJsDataset;
  }
  const factory: {
    dataset(quads?: Iterable<unknown>): RdfJsDataset;
  };
  export default factory;
}

declare module "@rdfjs/data-model" {
  interface RdfJsNamedNode {
    termType: "NamedNode";
    value: string;
  }
  const factory: Record<string, unknown> & {
    namedNode(value: string): RdfJsNamedNode;
  };
  export default factory;
}

declare module "shacl-engine" {
  export interface ValidationResultTerm {
    value: string;
  }
  export interface ValidationResult {
    focusNode?: { term?: ValidationResultTerm };
    path?: Array<{ predicates?: ValidationResultTerm[] }>;
    message?: ValidationResultTerm[];
    constraintComponent?: ValidationResultTerm;
  }
  export interface ValidationReport {
    conforms: boolean;
    results: ValidationResult[];
  }
  export class Validator {
    constructor(shapes: unknown, options?: Record<string, unknown>);
    validate(input: { dataset: unknown }): Promise<ValidationReport>;
  }
}

declare module "shacl-engine/sparql.js" {
  export const targetResolvers: Record<string, unknown>;
  export const validations: Record<string, unknown>;
}
