# advfab.org

Static, dependency-free source for the Advanced Fabrics project website. Cloudflare Pages publishes this repository with `/` as the output directory and no build command.
Source for advfab.org

The pages share one light design system with the Public Edge and Among Clusters
sites (`styles.css`, `boot.js`, `site.js`) and load the RE8CH navigator and
footer web components from `brand-assets.re8ch.com`, which `_headers` allows in
the CSP. `fabric.js` draws the home-page evidence fabric from
`wiki/data/cluster-snapshot.json`.

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
