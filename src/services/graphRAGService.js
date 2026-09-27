export async function queryGraphRAG(question) {
  try {
    const params = new URLSearchParams({ q: question });
    const response = await fetch(`http://localhost:4000/api/graph/query?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Graph query request failed');
    }
    return await response.json();
  } catch (error) {
    return {
      source: 'offline',
      answer: 'Local graph service is not running yet. Start Neo4j + the Graph API to enable the live relationship query.',
      error: error.message,
      routeNodes: [],
      routeEdges: [],
      confidence: 'low',
    };
  }
}
