const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const USER_ID = "SanyamSingla_27062005";
const EMAIL_ID = "sanyam2520.be23@chitkara.edu.in";
const COLLEGE_ROLL_NUMBER = "2310992520";

app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        error: "data must be an array"
      });
    }

    const invalid_entries = [];
    const duplicate_edges = [];

    const edgeSet = new Set();
    const duplicateSet = new Set();

    const graph = {};
    const childParent = {};
    const allNodes = new Set();

    // Validation + Graph Creation
    for (let item of data) {
      if (typeof item !== "string") {
        invalid_entries.push(item);
        continue;
      }

      item = item.trim();

      if (!/^[A-Z]->[A-Z]$/.test(item)) {
        invalid_entries.push(item);
        continue;
      }

      const [parent, child] = item.split("->");

      if (parent === child) {
        invalid_entries.push(item);
        continue;
      }

      // Duplicate Edge
      if (edgeSet.has(item)) {
        if (!duplicateSet.has(item)) {
          duplicate_edges.push(item);
          duplicateSet.add(item);
        }
        continue;
      }

      edgeSet.add(item);

      // Multi Parent Rule
      if (childParent[child]) {
        continue;
      }

      childParent[child] = parent;

      if (!graph[parent]) graph[parent] = [];
      graph[parent].push(child);

      allNodes.add(parent);
      allNodes.add(child);
    }

    // Connected Components
    const undirected = {};

    for (const node of allNodes) {
      undirected[node] = [];
    }

    for (const parent in graph) {
      for (const child of graph[parent]) {
        undirected[parent].push(child);
        undirected[child].push(parent);
      }
    }

    const visited = new Set();
    const groups = [];

    for (const node of allNodes) {
      if (visited.has(node)) continue;

      const queue = [node];
      const component = [];

      visited.add(node);

      while (queue.length) {
        const curr = queue.shift();
        component.push(curr);

        for (const neigh of undirected[curr]) {
          if (!visited.has(neigh)) {
            visited.add(neigh);
            queue.push(neigh);
          }
        }
      }

      groups.push(component);
    }

    const hierarchies = [];

    let total_trees = 0;
    let total_cycles = 0;

    let largest_tree_root = "";
    let largestDepth = 0;

    function detectCycle(node, visiting, visitedCycle, allowedNodes) {
      if (visiting.has(node)) return true;
      if (visitedCycle.has(node)) return false;

      visiting.add(node);

      for (const child of graph[node] || []) {
        if (!allowedNodes.has(child)) continue;

        if (
          detectCycle(
            child,
            visiting,
            visitedCycle,
            allowedNodes
          )
        ) {
          return true;
        }
      }

      visiting.delete(node);
      visitedCycle.add(node);

      return false;
    }

    function buildTree(node) {
      const result = {};

      for (const child of graph[node] || []) {
        result[child] = buildTree(child);
      }

      return result;
    }

    function getDepth(node) {
      const children = graph[node] || [];

      if (!children.length) return 1;

      let maxDepth = 0;

      for (const child of children) {
        maxDepth = Math.max(maxDepth, getDepth(child));
      }

      return maxDepth + 1;
    }

    for (const component of groups) {
      const componentSet = new Set(component);

      const roots = component.filter(
        n => !childParent[n]
      );

      let root;

      if (roots.length) {
        roots.sort();
        root = roots[0];
      } else {
        root = [...component].sort()[0];
      }

      const hasCycle = detectCycle(
        root,
        new Set(),
        new Set(),
        componentSet
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
        depth > largestDepth ||
        (depth === largestDepth &&
          root < largest_tree_root)
      ) {
        largestDepth = depth;
        largest_tree_root = root;
      }

      hierarchies.push({
        root,
        tree,
        depth
      });
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});