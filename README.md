# `jedi-ts`: These aren't the JSON documents you're looking for...

This is a TypeScript implementation of the JSON Edit Distance (JEDI) algorithm, as proposed in the paper [JEDI: These aren't the JSON documents you're looking for... (Extended Version)](https://arxiv.org/pdf/2201.08099).

## Installation

You can install the package from the GitHub registry using npm, pnpm, or yarn:

### npm
```sh
npm install @aeye-sa/jedi-ts --registry=https://npm.pkg.github.com
```

### pnpm
```sh
pnpm add @aeye-sa/jedi-ts --registry=https://npm.pkg.github.com
```

### yarn
```sh
yarn add @aeye-sa/jedi-ts --registry=https://npm.pkg.github.com
```

## Usage

The package default exports a `jediMetric` function that calculates the similarity between two JSON structures using the JEDI distance metric. You can use this function as follows:

```javascript
import jediMetric from '@aeye-sa/jedi-ts';

const output = { ... };
const expected = { ... };

const similarity = jediMetric(output, expected);
console.log(`Similarity: ${similarity}`);
```

This value is normalized from 0-1.

## Original Paper and Repository

This implementation is based on the paper [JEDI: These aren't the JSON documents you're looking for... (Extended Version)](https://github.com/DatabaseGroup/jedi-experiments), which was originally published at the ACM SIGMOD conference in 2022.

The original repository, also licensed under MIT, can be found here: [https://github.com/DatabaseGroup/jedi-experiments](https://github.com/DatabaseGroup/jedi-experiments).

### BibTeX

```
@inproceedings{DBLP:conf/sigmod/HutterAAKC22,
  author    = {Thomas H{\"{u}}tter and
               Nikolaus Augsten and
               Christoph M. Kirsch and
               Michael J. Carey and
               Chen Li},
  title     = {{JEDI}: These aren't the {JSON} documents you're looking for... (Extended
               Version)},
  booktitle = {Proceedings of the 2022 International Conference on Management of Data,
               {SIGMOD} Conference 2022, Philadelphia, PA, USA, June 12-17, 2022},
  pages     = {1741--1754},
  publisher = {{ACM}},
  year      = {2022},
  url       = {https://doi.org/10.1145/3514221.3517876},
  doi       = {10.1145/3514221.3517876},
  timestamp = {Fri, 10 Jun 2022 14:01:57 +0200},
  biburl    = {https://dblp.org/rec/conf/sigmod/HutterAAKC22.bib},
  bibsource = {dblp computer science bibliography, https://dblp.org}
}
```