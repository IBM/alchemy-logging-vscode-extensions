
/**
 * Regex Description:
 * 1st Capturing Group (error): error matches the characters error literally (case sensitive)
 * \. matches the character . literally
 * ? matches the previous token between 0 and 1 times, as many times as possible, giving back as needed (greedy)
 * . matches any character (except for line terminators)
 * * matches the previous token between zero and unlimited times, as many times as possible, giving back as needed (greedy)
 * Match a single character present in the list below [\n\s]
 * * matches the previous token between zero and unlimited times
 * Match one of quotes present in the list [\"\']
 * < matches the character <
 * ? matches the previous token between 0 and 1 times
 * Non-capturing group (?:[A-Z]?|[A-Z]{3})
 */
export const errorFirstRegex = new RegExp('(error)\.?.*\\([\\n\\s]*[\"\']<?(?:[A-Z]?|[A-Z]{3})', 'g');

/**
 * Regex Description:
 * ^ asserts position at start of a line
 * log matches the characters log literally (case sensitive)
 * \. matches the character . literally
 * 1st Capturing Group ([a-z]{4,7}[1-5]?)
 *   Match a single character present in the list below [a-z]
 *     {4,7} matches the previous token between 4 and 7 times, as many times as possible, giving back as needed (greedy)
 *     a-z matches a single character (case sensitive)
 *   Match a single character present in the list below [1-5]
 *     ? matches the previous token between 0 and 1 times
 *     1-5 matches a single character in the range between 1 and 5 times
 * \( matches the character ( literally
 * Match a single character present in the list below [\n\s]
 * * matches the previous token between zero and unlimited times
 * Match one of quotes present in the list [\"\']
 * < matches the character <
 */

export const logFirstRegex = new RegExp("^log\.([a-z]{4,7}[1-5]?)\\([\\n\\s]*[\"\']<?(?:[A-Z]?|[A-Z]{3})", "gs");

/**
 * Regex Description:
 * 1st Capturing Group ([A-Z]{3}) : Match a single character present in the list below [A-Z]
 * {3} matches the previous token exactly 3 times
 */
export const prefixCheckRegex = new RegExp('([A-Z]{3})', 'gs');