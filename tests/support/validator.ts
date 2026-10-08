import { readFile } from "node:fs/promises";

import rdfDataModel from "@rdfjs/data-model";
import rdfDataset from "@rdfjs/dataset";
import { Store } from "oxigraph";
import { Validator } from "shacl-engine";
import { targetResolvers, validations } from "shacl-engine/sparql.js";

// The ontology refers to PROV-O without loading it. These are the standard
// prov:Agent subclasses that the sh:class checks need.
const PROV_AGENT_AXIOMS = `
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
prov:Person rdfs:subClassOf prov:Agent .
prov:Organization rdfs:subClassOf prov:Agent .
prov:SoftwareAgent rdfs:subClassOf prov:Agent .
`;

export type Violation = {
  focusNode?: string;
  path?: string;
  message: string;
};

/** Loads Turtle files into one Oxigraph store. */
export async function loadTurtle(...paths: (string | URL)[]): Promise<Store> {
  const store = new Store();
  for (const path of paths) {
    store.load(await readFile(path, "utf8"), { format: "text/turtle" });
  }
  return store;
}

/** The shapes graph: the shapes, the ontology, and the PROV agent axioms. */
export async function loadShapes(
  shapesPath: string | URL,
  ontologyPath: string | URL,
): Promise<Store> {
  const store = await loadTurtle(ontologyPath, shapesPath);
  store.load(PROV_AGENT_AXIOMS, { format: "text/turtle" });
  return store;
}

function createFactory() {
  const factory = Object.create(rdfDataModel) as typeof rdfDataModel & {
    dataset: typeof rdfDataset.dataset;
  };
  factory.dataset = ((...args: Parameters<typeof rdfDataset.dataset>) =>
    rdfDataset.dataset(...args)) as typeof rdfDataset.dataset;
  return factory;
}

/** Validates the data against the shapes, with the SHACL-SPARQL extension. */
export async function validate(
  shapes: Store,
  data: Store,
): Promise<{ conforms: boolean; violations: Violation[] }> {
  const validator = new Validator(rdfDataset.dataset(shapes.match()), {
    factory: createFactory(),
    targetResolvers,
    validations,
  });
  const report = await validator.validate({
    dataset: rdfDataset.dataset(data.match()),
  });
  const violations = report.results.map((result): Violation => ({
    ...(result.focusNode?.term?.value
      ? { focusNode: result.focusNode.term.value as string }
      : {}),
    ...(result.path?.[0]?.predicates?.[0]?.value
      ? { path: result.path[0].predicates[0].value as string }
      : {}),
    message:
      result.message?.map((term: { value: string }) => term.value).join("; ") ||
      (result.constraintComponent?.value as string) ||
      "The data violates a SHACL shape.",
  }));
  return { conforms: report.conforms, violations };
}
