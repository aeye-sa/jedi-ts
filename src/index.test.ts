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

describe("JEDI Metric with Weighted String Distance", () => {
    test("should give higher similarity for similar strings", () => {
        const obj1 = { name: "John Smith" };
        const obj2 = { name: "Jon Smith" };
        const obj3 = { name: "Robert Jones" };

        const sim1 = jediMetric(obj1, obj2, true);
        const sim2 = jediMetric(obj1, obj3, true);

        // "John Smith" vs "Jon Smith" should have higher similarity
        // than "John Smith" vs "Robert Jones"
        expect(sim1).toBeGreaterThan(sim2);
    });

    test("should handle key name similarities", () => {
        const obj1 = { userProfile: { value: 123 } };
        const obj2 = { user_profile: { value: 123 } };
        const obj3 = { accountSettings: { value: 123 } };

        const sim1 = jediMetric(obj1, obj2, true);
        const sim2 = jediMetric(obj1, obj3, true);

        // "userProfile" vs "user_profile" should have higher similarity
        // than "userProfile" vs "accountSettings"
        expect(sim1).toBeGreaterThan(sim2);
    });

    test("should compare weighted vs non-weighted differences", () => {
        const obj1 = { description: "This is a test message" };
        const obj2 = { description: "This is a test mesage" }; // Single letter typo
        const obj3 = { description: "A completely different text" };

        // Compare with weighted string distance
        const weightedSim1 = jediMetric(obj1, obj2, true);
        const weightedSim2 = jediMetric(obj1, obj3, true);

        // Compare without weighted string distance
        const normalSim1 = jediMetric(obj1, obj2, false);
        const normalSim2 = jediMetric(obj1, obj3, false);

        // With weighted distance, small typos should result in higher similarity
        expect(weightedSim1).toBeGreaterThan(normalSim1);

        // Both weighted should show lower similarity for completely different strings
        expect(weightedSim2).toBeLessThan(weightedSim1);

        // Non-weighted should not have this distinction
        expect(normalSim2).toEqual(normalSim1);
    });

    test("should handle arrays with similar strings", () => {
        const arr1 = ["hello world", "test message", "goodbye"];
        const arr2 = ["helo world", "test mesage", "goodby"]; // Small typos
        const arr3 = ["different", "completely", "changed"]; // Different content

        const sim1 = jediMetric(arr1, arr2, true);
        const sim2 = jediMetric(arr1, arr3, true);

        // Small typos should result in higher similarity than completely different strings
        expect(sim1).toBeGreaterThan(sim2);
        expect(sim1).toBeGreaterThan(0.8); // High similarity expected for small typos

        expect(sim2).toBeLessThan(0.8); // Low similarity expected for different content
    });

    test("should handle case sensitivity appropriately", () => {
        const obj1 = { name: "john smith" };
        const obj2 = { name: "John Smith" };
        const obj3 = { name: "JOHN SMITH" };
        const obj4 = { name: "Jane Smith" };

        const sim1 = jediMetric(obj1, obj2, true);
        const sim2 = jediMetric(obj1, obj3, true);
        const sim3 = jediMetric(obj1, obj4, true);

        // Case differences should result in high similarity
        expect(sim1).toBeGreaterThan(0.9);
        expect(sim2).toBeGreaterThan(0.9);
        // Different name should have lower similarity
        expect(sim3).toBeLessThan(sim1);
    });

    test("should handle special characters and punctuation", () => {
        const obj1 = { text: "hello-world" };
        const obj2 = { text: "hello_world" };
        const obj3 = { text: "hello world" };
        const obj4 = { text: "hello/world" };

        const similarities = [
            jediMetric(obj1, obj2, true),
            jediMetric(obj1, obj3, true),
            jediMetric(obj1, obj4, true),
        ];

        // All variations should have high similarity
        similarities.forEach((sim) => {
            expect(sim).toBeGreaterThan(0.8);
        });
    });

    test("should handle number-like strings", () => {
        const obj1 = { id: "12345" };
        const obj2 = { id: "12354" }; // transposed digits
        const obj3 = { id: "12346" }; // one digit different
        const obj4 = { id: "54321" }; // completely different order

        const sim1 = jediMetric(obj1, obj2, true);
        const sim2 = jediMetric(obj1, obj3, true);
        const sim3 = jediMetric(obj1, obj4, true);

        // Transposed digits should have lower similarity than one digit difference
        // (because it requires more operations to fix)
        expect(sim2).toBeGreaterThan(sim1);
        // Different order should have lowest similarity
        expect(sim3).toBeLessThan(sim2);
    });

    test("should handle multilingual strings", () => {
        const obj1 = { text: "こんにちは" };
        const obj2 = { text: "こんにちわ" }; // Similar Japanese
        const obj3 = { text: "你好" }; // Different language (Chinese)

        const sim1 = jediMetric(obj1, obj2, true);
        const sim2 = jediMetric(obj1, obj3, true);

        // Similar characters in same language should have higher similarity
        expect(sim1).toBeGreaterThan(sim2);
        expect(sim1).toBeGreaterThan(0.7);
    });

    test("same properties in different order should have high similarity", () => {
        const obj1 = {
            name: "John",
            details: {
                age: 30,
                city: "New York",
            },
        };
        const obj2 = {
            details: {
                city: "New York",
                age: 30,
            },
            name: "John",
        };
        expect(jediMetric(obj1, obj2, true)).toBe(1);
    });

    test("similar property values with different ordering should have high similarity", () => {
        const obj1 = {
            name: "John",
            details: {
                age: 30,
                city: "New York",
            },
        };
        const obj2 = {
            details: {
                city: "New York",
                age: 30,
            },
            name: "John",
        };
        const obj3 = {
            deatails: {
                city: "New York",
                age: 30,
            },
            name: "John",
        };
        const obj4 = {
            deatails: {
                city: "Noo York",
                age: 30,
            },
            name: "John",
        };

        const metric12 = jediMetric(obj1, obj2, true);
        const metric13 = jediMetric(obj1, obj3, true);
        const metric14 = jediMetric(obj1, obj4, true);
        const metric14ns = jediMetric(obj2, obj3, false);

        expect(metric12).toBe(1);
        expect(metric13).toBeLessThan(1);
        expect(metric14).toBeLessThan(metric13);
        expect(metric14ns).toBeLessThan(metric14);
    });

    test("similar property values with different ordering", () => {
        const obj1 = {
            person: {
                firstName: "Jonathan",
                lastName: "Smith",
            },
        };
        const obj2 = {
            person: {
                lastName: "Smyth",
                firstName: "John",
            },
        };
        const similarity = jediMetric(obj1, obj2, true);
        expect(similarity).toBeGreaterThan(0.8);
    });

    test("deeply nested property ordering", () => {
        const obj1 = {
            level1: {
                level2: {
                    a: "test",
                    b: "example",
                },
            },
        };
        const obj2 = {
            level1: {
                level2: {
                    b: "example",
                    a: "test",
                },
            },
        };
        expect(jediMetric(obj1, obj2, true)).toBe(1);
    });
});
