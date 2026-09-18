# Taiwan county boundaries

`taiwan-counties.topo.json` is the 22-county TopoJSON distributed by [Taiwan.md](https://taiwan.md/taiwan-shape/), extracted from [waiting7777/taiwan-vue-components](https://github.com/waiting7777/taiwan-vue-components) (MIT License, 2018). It is bundled locally so the map works without a third-party runtime request. County names are normalized from 臺 to 台 in the loader.

`taiwan-counties-20200820.topo.json` is a snapshot of [kiang/taiwan_basecode county/topo/20200820.json](https://kiang.github.io/taiwan_basecode/county/topo/20200820.json), retrieved on 2026-09-18. The filename is the upstream version label, not a claim of current boundaries. It contains a `20200820` county geometry collection with 22 features; some offshore geometry extends far beyond the main island.

`taiwan-districts-20230317.topo.json` is a snapshot of [kiang/taiwan_basecode city/topo/20230317.json](https://kiang.github.io/taiwan_basecode/city/topo/20230317.json), retrieved on 2026-09-18. The source is [MIT licensed](https://github.com/kiang/taiwan_basecode/blob/gh-pages/LICENSE). Its `20230317` object contains 368 town/district geometries, loaded only when entering a county. This version label is not a claim that boundaries are current.
