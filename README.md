# `jedi-ts`: These aren't the JSON documents you're looking for...

This is a TypeScript implementation of the JSON Edit Distance (JEDI) algorithm, as proposed in the paper [JEDI: These aren't the JSON documents you're looking for... (Extended Version)](https://arxiv.org/pdf/2201.08099).

This implementation extends the original JEDI algorithm with abilities some consider to be... unnatural. Like a well-trained Jedi sensing disturbances in the Force, it can detect subtle differences between strings that a simple binary comparison would miss. Fear not, for this path does not lead to the dark side - it merely brings more balance to your JSON comparisons.

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

// Calculate similarity using JEDI distance metric
const similarity = jediMetric(output, expected);
console.log(`Similarity: ${similarity}`);
```

This value is normalized from 0-1.

The function accepts an optional third parameter `stringDistanceWeighted` that enables weighted string distance calculations:

```javascript
const similarityWeighted = jediMetric(output, expected, true);
```

When enabled, string differences are weighted by their Levenshtein distance instead of using fixed costs. This means that small string differences (like typos) will have less impact on the similarity score than completely different strings. This is a deviation from the original paper that can provide more nuanced results for string comparisons.

## Original Paper and Repository

This implementation is based on the paper [JEDI: These aren't the JSON documents you're looking for... (Extended Version)](https://github.com/DatabaseGroup/jedi-experiments), which was originally published at the ACM SIGMOD conference in 2022.

The original repository, also licensed under MIT, can be found here: [https://github.com/DatabaseGroup/jedi-experiments](https://github.com/DatabaseGroup/jedi-experiments).

### BibTeX

```bibtex
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