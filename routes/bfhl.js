const express = require("express");
const router = express.Router();

const USER_ID = "yourname_ddmmyyyy";
const EMAIL_ID = "yourcollegeemail@college.edu";
const COLLEGE_ROLL_NUMBER = "YOUR_ROLL_NUMBER";

router.post("/", (req, res) => {
  try {
    const data = req.body.data;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        error: "data must be an array"
      });
    }

    const invalid_entries = [];
    const duplicate_edges = [];

    const edgeSet = new Set();
    const duplicateSet = new Set();

    const parentMap = {};
    const childParent = {};
    const allNodes = new Set();

    for (let entry of data) {
      if (typeof entry !== "string") {
        invalid_entries.push(entry);
        continue;
      }

      entry = entry.trim();

      const regex = /^[A-Z]->[A-Z]$/;

      if (!regex.test(entry)) {
        invalid_entries.push(entry);
        continue;
      }

      const [parent, child] = entry.split("->");

      if (parent === child) {
        invalid_entries.push(entry);
        continue;
      }

      if (edgeSet.has(entry)) {
        if (!duplicateSet.has(entry)) {
          duplicate_edges.push(entry);
          duplicateSet.add(entry);
        }
        continue;
      }

      edgeSet.add(entry);

      if (childParent[child]) {
        continue;
      }

      childParent[child] = parent;

      if (!parentMap[parent]) {
        parentMap[parent] = [];
      }

      parentMap[parent].push(child);

      allNodes.add(parent);
      allNodes.add(child);
    }

    const visitedGlobal = new Set();
    const hierarchies = [];

    const roots = [...allNodes].filter(
      node => !Object.keys(childParent).includes(node)
    );

    function buildTree(node) {
      const children = parentMap[node] || [];

      const result = {};

      for (const child of children) {
        result[child] = buildTree(child);
      }

      return result;
    }

    function getDepth(node) {
      const children = parentMap[node] || [];

      if (children.length === 0) return 1;

      let maxDepth = 0;

      for (const child of children) {
        maxDepth = Math.max(maxDepth, getDepth(child));
      }

      return maxDepth + 1;
    }

    function detectCycle(node, visiting, visited) {
      if (visiting.has(node)) return true;
      if (visited.has(node)) return false;

      visiting.add(node);

      const children = parentMap[node] || [];

      for (const child of children) {
        if (detectCycle(child, visiting, visited)) {
          return true;
        }
      }

      visiting.delete(node);
      visited.add(node);

      return false;
    }

    let total_trees = 0;
    let total_cycles = 0;

    let largest_tree_root = "";
    let largest_depth = -1;

    for (const root of roots.sort()) {
      if (visitedGlobal.has(root)) continue;

      const stack = [root];

      while (stack.length) {
        const curr = stack.pop();

        if (visitedGlobal.has(curr)) continue;

        visitedGlobal.add(curr);

        for (const child of parentMap[curr] || []) {
          stack.push(child);
        }
      }

      const hasCycle = detectCycle(
        root,
        new Set(),
        new Set()
      );

      if (hasCycle) {
        total_cycles++;

        hierarchies.push({
          root,
          tree: {},
          has_cycle: true
        });

        continue;
      }

      const tree = {
        [root]: buildTree(root)
      };

      const depth = getDepth(root);

      total_trees++;

      if (
        depth > largest_depth ||
        (depth === largest_depth &&
          root < largest_tree_root)
      ) {
        largest_depth = depth;
        largest_tree_root = root;
      }

      hierarchies.push({
        root,
        tree,
        depth
      });
    }

    const unvisitedNodes = [...allNodes].filter(
      node => !roots.includes(node)
    );

    for (const node of unvisitedNodes) {
      const cycle = detectCycle(
        node,
        new Set(),
        new Set()
      );

      if (cycle) {
        total_cycles++;

        hierarchies.push({
          root: node,
          tree: {},
          has_cycle: true
        });
      }
    }

    res.json({
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL_NUMBER,
      hierarchies,
      invalid_entries,
      duplicate_edges,
      summary: {
        total_trees,
        total_cycles,
        largest_tree_root
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;