# Invalid bcfOWL test data

Each file here **must fail** SHACL validation against
`shapes/bcfOWL-shapes.ttl`. They exist so the shapes are proven to
reject, not only to accept: a shape with a typo in its target passes every
valid dataset and catches nothing.

One violation per file, named after the rule it breaks. A file with two
independent faults cannot show which rule caught it.

`tests/shapes.test.ts` loads each file together with the valid project,
validates it, and asserts both that the report does not conform and that the
expected message appears.

Each file reuses the shared valid project in `../valid-project.ttl`, so the
only reason it fails is the fault it is named for.
