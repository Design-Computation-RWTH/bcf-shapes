# bcfOWL-shapes

This repository contains the SHACL conformance profile for [bcfOWL 1.0.0](https://github.com/Design-Computation-RWTH/bcfOWL)(`https://w3id.org/bcfOWL#`).

bcfOWL states no cardinality restrictions. Under the open-world assumption, OWL infers instead of checking. A Topic without a title does not violate `owl:minCardinality 1`. The shapes check the BCF structure of a dataset under the closed-world assumption, for example:

- a Project has exactly one identifier, title, and reference space;
- a Topic has exactly one title and at most one status, and it belongs to exactly one Project;
- each type, status, label, priority, and stage value of a Topic is a member of the matching scheme of the project;
- each creator, assignee, and last editor is a user of the project;
- a Viewpoint has exactly one camera projection;
- a Comment belongs to exactly one Topic, in the same project as the Topic.

The shapes target only the BCF coordination layer. A photograph, its capture (`sosa:Observation`), or its media is not constrained until a Viewpoint refers to it.

- Shapes: [`shapes/bcfOWL-shapes.ttl`](shapes/bcfOWL-shapes.ttl)
- Shapes namespace: `https://w3id.org/bcfOWL/shapes#` (prefix `bcfsh`)
- Test data: [`test-data/`](test-data)

## Use the shapes

Give the validator `shapes/bcfOWL-shapes.ttl` and the bcfOWL ontology as the shapes graph, and your data as the data graph. The validator must support the SHACL-SPARQL extension. Without it, the checks of the controlled vocabularies and of the project consistency do not run.

## Provenance and RDF 1.2

The test data `valid-provenance.ttl` records the change history of a Topic with RDF 1.2 triple terms. The shapes do not check this history yet.

SHACL Core can check a reifier, because a reifier is a usual node. SHACL Core cannot read the statement inside a triple term. A SHACL-SPARQL rule can read it, but only if the SPARQL engine supports SPARQL 1.2. Support for this differs between validators, and it is not verified yet.

## Run the tests

You need Node.js 22 or later.

```sh
npm install
npm test
```

The tests make sure that each `valid-*.ttl` file in `test-data/` conforms alone, and that each file in `test-data/invalid/` fails for its one rule.

The tests use a copy of the ontology in `tests/support/bcfOWL.ttl`.

## Licenses

- Shapes and test data: [CC BY 4.0](LICENSE-DATA)
- Test code: [MIT](LICENSE)

## Author

Oliver Schulz, [Design Computation, RWTH Aachen University](https://dc.rwth-aachen.de/)
