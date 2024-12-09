import { describe, test, expect } from "vitest";
import jediMetric from "./index.js";

describe("JEDI Metric", () => {
    // Test cases from Figure 1 & 2 of the paper
    test("should calculate correct distance for movie examples from Figure 1", () => {
        const movie1 = {
            "title": "Star Wars - A New Hope",
            "running time": 125,
            "cast": {
                Han: "Ford",
                Leia: "Fisher",
            },
        };

        const movie2 = {
            "cast": [
                "Ford",
                "Fisher",
            ],
            "running time": 125,
            "name": "Star Wars - A New Hope",
        };

        // From the paper: JEDI distance should be 5
        // Operations:
        // 1. delete "Han"
        // 2. delete "Leia"
        // 3. delete {} from left tree
        // 4. insert [] into right tree
        // 5. rename "title" to "name"
        const expectedDistance = 5;
        const maxPossibleDistance = Math.max(11, 9); // Tree sizes from Figure 2
        const expectedSimilarity = 1 - (expectedDistance / maxPossibleDistance);

        const similarity = jediMetric(movie1, movie2);
        expect(similarity).toBeCloseTo(expectedSimilarity, 2);
    });

    // Test case from Figure 3 of the paper
    test("should respect document structure with nested objects", () => {
        const doc1 = {
            l1: {
                a: "x1",
                b: "x2",
            },
            l2: {
                c: "x3",
                d: "x4",
            },
        };

        const doc2 = {
            m1: {
                a: "y1",
                c: "y3",
            },
            m2: {
                b: "y2",
                d: "y4",
            },
        };

        // From the paper: with document-preserving constraint,
        // distance should be higher than simple key-value matching
        const similarity1 = jediMetric(doc1, doc2);

        // Compare with a more similar document
        const doc3 = {
            l1: {
                a: "x1",
                b: "x2",
            },
            l2: {
                c: "x3",
                d: "x4",
            },
        };

        const similarity2 = jediMetric(doc1, doc3);
        expect(similarity2).toBeGreaterThan(similarity1);
    });

    // Basic type and structure tests
    test("should handle different JSON types correctly", () => {
        const types1 = {
            num: 42,
            str: "hello",
            bool: true,
            null: null,
            arr: [1, 2, 3],
            obj: { a: 1 },
        };

        const types2 = {
            num: 42,
            str: "hello",
            bool: true,
            null: null,
            arr: [1, 2, 3],
            obj: { a: 1 },
        };

        expect(jediMetric(types1, types2)).toBe(1);
    });

    test("should handle array order sensitivity", () => {
        const arr1 = ["A", "B", "C"];
        const arr2 = ["A", "B", "C"];
        const arr3 = ["A", "C", "B"];

        const similarity1 = jediMetric(arr1, arr2);
        const similarity2 = jediMetric(arr1, arr3);

        expect(similarity1).toBe(1);
        expect(similarity2).toBeLessThan(1);
    });

    test("should handle object key order insensitivity", () => {
        const obj1 = {
            a: 1,
            b: 2,
            c: 3,
        };

        const obj2 = {
            c: 3,
            a: 1,
            b: 2,
        };

        expect(jediMetric(obj1, obj2)).toBe(1);
    });

    test("should handle nested structures correctly", () => {
        const nested1 = {
            a: {
                b: [1, 2, { c: "d" }],
            },
        };

        const nested2 = {
            a: {
                b: [1, 2, { c: "different" }],
            },
        };

        const nested3 = {
            a: {
                b: [1, 2, { c: "d" }],
            },
        };

        expect(jediMetric(nested1, nested2)).toBeLessThan(1);
        expect(jediMetric(nested1, nested3)).toBe(1);
    });

    // Edge cases
    test("should handle empty structures", () => {
        expect(jediMetric({}, {})).toBe(1);
        expect(jediMetric([], [])).toBe(1);
        expect(jediMetric({}, [])).toBeLessThan(1);
    });

    test("should handle null values", () => {
        expect(jediMetric(null, null)).toBe(1);
        expect(jediMetric({ a: null }, { a: null })).toBe(1);
        expect(jediMetric({ a: null }, { a: undefined })).toBeLessThan(1);
    });

    // Complex examples from paper
    test("should handle complex object transformations", () => {
        const original = {
            menu: {
                items: [
                    {
                        id: 1,
                        name: "Item 1",
                    },
                    {
                        id: 2,
                        name: "Item 2",
                    },
                ],
                metadata: {
                    lastUpdated: "2024-01-01",
                },
            },
        };

        // Test various transformations
        const structuralChange = {
            menu: {
                itemsList: [
                    {
                        id: 1,
                        name: "Item 1",
                    },
                    {
                        id: 2,
                        name: "Item 2",
                    },
                ],
                metadata: {
                    lastUpdated: "2024-01-01",
                },
            },
        };

        const valueChange = {
            menu: {
                items: [
                    {
                        id: 1,
                        name: "Changed Name",
                    },
                    {
                        id: 2,
                        name: "Item 2",
                    },
                ],
                metadata: {
                    lastUpdated: "2024-01-01",
                },
            },
        };

        const arrayOrderChange = {
            menu: {
                items: [
                    {
                        id: 2,
                        name: "Item 2",
                    },
                    {
                        id: 1,
                        name: "Item 1",
                    },
                ],
                metadata: {
                    lastUpdated: "2024-01-01",
                },
            },
        };

        // Structural changes should have lower similarity than value changes
        const structuralSimilarity = jediMetric(original, structuralChange);
        const valueSimilarity = jediMetric(original, valueChange);
        const orderSimilarity = jediMetric(original, arrayOrderChange);

        expect(structuralSimilarity).toBeLessThan(valueSimilarity);
        expect(orderSimilarity).toBeLessThan(1);
    });
    test("should handle different types of changes appropriately", () => {
        // Simple structure to test different types of changes
        const original = {
            items: [
                {
                    id: 1,
                    label: "A",
                },
                {
                    id: 2,
                    label: "B",
                },
            ],
        };

        // Structural change: renamed key
        const structuralChange = {
            elements: [
                {
                    id: 1,
                    label: "A",
                },
                {
                    id: 2,
                    label: "B",
                },
            ],
        };

        // Value change: modified leaf node
        const valueChange = {
            items: [
                {
                    id: 1,
                    label: "Modified",
                },
                {
                    id: 2,
                    label: "B",
                },
            ],
        };

        // Array order change: same elements, different order
        const orderChange = {
            items: [
                {
                    id: 2,
                    label: "B",
                },
                {
                    id: 1,
                    label: "A",
                },
            ],
        };

        // Additional items change
        const itemsChange = {
            items: [
                {
                    id: 1,
                    label: "A",
                },
                {
                    id: 2,
                    label: "B",
                },
                {
                    id: 3,
                    label: "C",
                },
            ],
        };

        const structuralSim = jediMetric(original, structuralChange);
        const valueSim = jediMetric(original, valueChange);
        const orderSim = jediMetric(original, orderChange);
        const itemsSim = jediMetric(original, itemsChange);

        // Structural changes should have lower similarity than value changes
        expect(structuralSim).toBeLessThan(valueSim);

        // Order changes in arrays should affect similarity
        expect(orderSim).toBeLessThan(1);

        // Adding/removing items should have lower similarity than just reordering
        expect(itemsSim).toBeLessThan(orderSim);
    });

    test("should properly handle array mutations", () => {
        const original = ["A", "B", "C"];

        // Test different array mutations
        const reordered = ["B", "A", "C"];
        const modified = ["A", "X", "C"];
        const lengthChanged = ["A", "B", "C", "D"];

        const reorderSim = jediMetric(original, reordered);
        const modifySim = jediMetric(original, modified);
        const lengthSim = jediMetric(original, lengthChanged);

        // Reordering should affect similarity less than modification
        expect(reorderSim).toBeGreaterThan(modifySim);

        // Length changes should have lower similarity than reordering
        expect(lengthSim).toBeLessThan(reorderSim);
    });

    test("should handle object mutations appropriately", () => {
        const original = {
            a: 1,
            b: 2,
            c: 3,
        };

        // Test different object mutations
        const reordered = {
            c: 3,
            b: 2,
            a: 1,
        };

        const renamed = {
            x: 1,
            b: 2,
            c: 3,
        };

        const modified = {
            a: 999,
            b: 2,
            c: 3,
        };

        const reorderSim = jediMetric(original, reordered);
        const renameSim = jediMetric(original, renamed);
        const modifySim = jediMetric(original, modified);

        // Reordering object keys should not affect similarity
        expect(reorderSim).toBe(1);

        // Key renames should have lower similarity than value changes
        expect(renameSim).toBeLessThan(modifySim);
    });
});
