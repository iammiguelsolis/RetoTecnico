class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

export class AutocompleteTrie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    if (!word) return;
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }

  // Busca palabras que comiencen con un prefijo en tiempo O(m)
  suggest(prefix: string): string[] {
    if (!prefix) return [];

    let current = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) {
        return []; // Prefijo no existe en el árbol
      }
      current = current.children.get(char)!;
    }

    const results: Set<string> = new Set();
    this.dfs(current, prefix.toLowerCase(), results);
    return Array.from(results);
  }

  private dfs(node: TrieNode, currentWord: string, results: Set<string>) {
    if (node.isEndOfWord) {
      results.add(currentWord);
    }
    // Limitamos a 10 sugerencias por rendimiento para no saturar UI
    if (results.size >= 10) return;

    for (const [char, childNode] of node.children.entries()) {
      this.dfs(childNode, currentWord + char, results);
    }
  }
}
