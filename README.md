# advfab.org

Static, dependency-free source for the Advanced Fabrics project website. Cloudflare Pages publishes this repository with `/` as the output directory and no build command.
Source for advfab.org

## Public AdvFab snapshot

`/wiki/` is a read-only public projection of the evidence surfaces used by the
Advanced Fabric Headlamp plugin. `wiki/data/cluster-snapshot.json` contains only
aggregates, timestamps, booleans, counts, and domain-separated SHA-256
fingerprints. Raw Kubernetes objects and infrastructure identifiers must never
be added to this repository.

Identifiers use `SHA-256("advfab.org/public-v1\\0" + identifier)` truncated to
12 hexadecimal characters. Low-entropy identifiers that could be guessed must
be omitted instead of hashed. Refreshes must use the reviewed platform read API,
perform projection in memory, and inspect the resulting diff before commit.
