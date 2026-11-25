// Only terms reachable from the 30 questions and 120 choices are exported.
// Sorting restores the export order even for numeric words like "420".
const dictionaries = fitted.fields.map(field =>
  new Map(Object.keys(field).sort().map((word, index) => [word, [index, field[word]]]))
);
function vector(text, dict, offset) {
  const words = text.toLowerCase().match(/\b\w\w+\b/g) || [];
  const terms = words.concat(words.slice(1).map((word, i) => words[i] + " " + word));
  const counts = new Map();
  for (const term of terms) {
    if (!dict.has(term)) continue;
    counts.set(term, (counts.get(term) || 0) + 1);
  }
  const values = [...counts].map(([term, count]) => {
    const [i, idf] = dict.get(term);
    return [offset + i, count * idf];
  });
  const norm = Math.hypot(...values.map(entry => entry[1])) || 1;
  return values.map(([i, value]) => [i, value / norm]);
}
function classify(question, answer) {
  const features = [...vector(question, dictionaries[0], 0),
    ...vector(answer, dictionaries[1], dictionaries[0].size)];
  return fitted.models.map(model => {
    const scores = model.weights.map((weights, i) =>
      features.reduce((sum, [j, value]) => sum + weights[j] * value, model.bias[i]));
    return model.labels[scores.indexOf(Math.max(...scores))];
  });
}
