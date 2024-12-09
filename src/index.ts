/**
 * Calculates a similarity metric between two JSON structures using JEDI
 * Different operation types have different costs according to the paper:
 * - Structural changes (key renames, array/object conversions): 2.0
 * - Value modifications: 1.0
 * - Array reorderings: 0.5
 */
function jediMetric<T, E>(output: T, expected: E): number {
    // Convert JSON structures to JSON trees
    const tree1 = convertToJSONTree(output);
    const tree2 = convertToJSONTree(expected);

    // Calculate JEDI distance
    const distance = calculateJEDI(tree1, tree2);

    // Get total tree sizes for max possible distance
    const size1 = getTreeSize(tree1);
    const size2 = getTreeSize(tree2);

    // Max distance would be deleting all nodes from both trees (cost 2 per node)
    const maxDistance = (size1 + size2) * 2;
    return 1 - (distance / maxDistance);
}

type NodeType = "object" | "array" | "key" | "literal";

interface JSONNode {
    type: NodeType;
    label: string | null;
    children: JSONNode[];
}

function convertToJSONTree(value: any): JSONNode {
    if (value === null) {
        return {
            type: "literal",
            label: "null",
            children: [],
        };
    }

    if (typeof value !== "object") {
        return {
            type: "literal",
            label: String(value),
            children: [],
        };
    }

    if (Array.isArray(value)) {
        const node: JSONNode = {
            type: "array",
            label: null,
            children: [],
        };
        node.children = value.map(item => convertToJSONTree(item));
        return node;
    }

    const node: JSONNode = {
        type: "object",
        label: null,
        children: [],
    };

    // Sort object keys lexicographically
    const sortedKeys = Object.keys(value).sort();

    for (const key of sortedKeys) {
        const keyNode: JSONNode = {
            type: "key",
            label: key,
            children: [],
        };
        const valueNode = convertToJSONTree(value[key]);
        keyNode.children = [valueNode];
        node.children.push(keyNode);
    }

    return node;
}

function calculateJEDI(tree1: JSONNode | null, tree2: JSONNode | null): number {
    if (!tree1 || !tree2) {
        // Cost for complete deletion/insertion is 2 per node
        if (!tree1) return getTreeSize(tree2) * 2;
        return getTreeSize(tree1) * 2;
    }

    if (tree1.type !== tree2.type) {
        // For type mismatch, count as deletion of one tree and insertion of the other
        return getTreeSize(tree1) * 2 + getTreeSize(tree2) * 2;
    }

    let distance = 0;

    if (tree1.type === "key") {
        if (tree1.label !== tree2.label) {
            distance += 2.0; // Structural change (key rename)
        }
    }
    else if (tree1.type === "literal") {
        if (tree1.label !== tree2.label) {
            distance += 1.0; // Value modification
        }
    }

    // Calculate children distance based on node type
    if (tree1.type === "array") {
        distance += calculateArrayDistance(tree1.children, tree2.children);
    }
    else if (tree1.type === "object") {
        distance += calculateObjectDistance(tree1.children, tree2.children);
    }
    else {
        // For key nodes and literals, recurse on children
        for (let i = 0; i < tree1.children.length; i++) {
            distance += calculateJEDI(tree1.children[i], tree2.children[i]);
        }
    }

    return distance;
}

function calculateArrayDistance(arr1: JSONNode[], arr2: JSONNode[]): number {
    const m = arr1.length;
    const n = arr2.length;

    // If arrays are empty, return 0
    if (m === 0 && n === 0) return 0;

    // If one array is empty, cost is deletion/insertion of the other array
    if (m === 0) return arr2.reduce((sum, node) => sum + getTreeSize(node) * 2, 0);
    if (n === 0) return arr1.reduce((sum, node) => sum + getTreeSize(node) * 2, 0);

    // First find minimum cost perfect matching between elements
    const matchCosts: number[][] = Array(m).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            matchCosts[i][j] = calculateJEDI(arr1[i], arr2[j]);
        }
    }

    // Find minimum cost matching
    const used = new Set<number>();
    let totalCost = 0;
    const matches: [number, number][] = [];

    // First try to match identical elements
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (!used.has(j) && matchCosts[i][j] === 0) {
                used.add(j);
                matches.push([i, j]);
                break;
            }
        }
    }

    // Then match remaining elements greedily
    for (let i = 0; i < m; i++) {
        if (matches.some(([mi]) => mi === i)) continue;

        let bestJ = -1;
        let minCost = Infinity;
        for (let j = 0; j < n; j++) {
            if (!used.has(j) && matchCosts[i][j] < minCost) {
                minCost = matchCosts[i][j];
                bestJ = j;
            }
        }

        if (bestJ !== -1) {
            used.add(bestJ);
            matches.push([i, bestJ]);
            totalCost += minCost;
        }
        else {
            totalCost += getTreeSize(arr1[i]) * 2; // Delete unmatched element
        }
    }

    // Add cost for unmatched elements in arr2
    for (let j = 0; j < n; j++) {
        if (!used.has(j)) {
            totalCost += getTreeSize(arr2[j]) * 2;
        }
    }

    // Add reordering cost for matched pairs that are out of order
    let reorderCost = 0;
    for (let k = 0; k < matches.length; k++) {
        for (let l = k + 1; l < matches.length; l++) {
            const [i1, j1] = matches[k];
            const [i2, j2] = matches[l];
            if ((i1 < i2 && j1 > j2) || (i1 > i2 && j1 < j2)) {
                reorderCost += 0.5;
            }
        }
    }

    return totalCost + reorderCost;
}

function calculateObjectDistance(children1: JSONNode[], children2: JSONNode[]): number {
    let totalCost = 0;
    const used = new Set<number>();
    const matchCosts: {
        i: number;
        j: number;
        cost: number;
    }[] = [];

    // Calculate all pairwise match costs
    for (let i = 0; i < children1.length; i++) {
        for (let j = 0; j < children2.length; j++) {
            const cost = calculateJEDI(children1[i], children2[j]);
            matchCosts.push({
                i,
                j,
                cost,
            });
        }
    }

    // Sort matches by cost
    matchCosts.sort((a, b) => a.cost - b.cost);

    // First try to match nodes with same labels
    for (const { i, j, cost } of matchCosts) {
        if (!used.has(j) && children1[i].type === "key" && children2[j].type === "key"
            && children1[i].label === children2[j].label) {
            used.add(j);
            totalCost += cost;
        }
    }

    // Then match remaining nodes
    for (const { i, j, cost } of matchCosts) {
        if (!used.has(j)) {
            used.add(j);
            totalCost += cost;
        }
    }

    return totalCost;
}

function getTreeSize(node: JSONNode | null): number {
    if (!node) return 0;
    return 1 + node.children.reduce((sum, child) => sum + getTreeSize(child), 0);
}

export default jediMetric;
