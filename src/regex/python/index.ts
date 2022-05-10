

export const errorFirstRegex = new RegExp('(error)\.?.*\\(\"<?(?:[A-Z]?|[A-Z]{3})', 'gs');
export const logFirstRegex = new RegExp("^log\.([a-z]{4,7}[1-5]?)\\(\"<?(?:[A-Z]?|[A-Z]{3})", "gs");

// For phase 1, i.e with no prefix configuration, we are adding
// prefix consideration in the regex itself
// Once prefix configuration is added, uncomment following regexes
// const errorFirstRegex = new RegExp('(error)\..+\\(\"', 'gs');
// const logFirstRegex = new RegExp("^log\.([a-z]{4,7}[1-5]?)\\(\"", "gs");

export const prefixCheckRegex = new RegExp('([A-Z]{3})', 'gs');