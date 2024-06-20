interface UrlEntry {
  display_url: string;
  expanded_url: string;
  url: string;
  indices: number[];
}

interface DomainMatchDetail {
  domain: string;
  suffix: string;
  fullUrl: string;
}

interface UrlCheckResult {
  originalUrl: string;
  matches: DomainMatchDetail[];
  // Indicates if a match was found
  isMatchFound: boolean;
}

/**
 * Function to check URLs for specific domains and return match details.
 * @param urls - Array of URL entries to be checked.
 * @param domainsToCheck - Array of domain strings to check against.
 * @returns Array of UrlCheckResult containing matching details.
 */
export function checkUrlsForDomains(
  urls: UrlEntry[],
  domainsToCheck: string[]
): UrlCheckResult[] {
  return (
    urls
      .map((url: UrlEntry): UrlCheckResult => {
        // Initialize result with the original URL and an empty matches array
        const result: UrlCheckResult = {
          originalUrl: url.expanded_url,
          matches: [],
          // Initial value set to false
          isMatchFound: false,
        };

        // Check each domain to see if it is included in the expanded URL
        domainsToCheck.forEach((domain: string) => {
          if (url.expanded_url.includes(domain)) {
            // Calculate the suffix part of the URL after the domain
            const startIndex: number =
              url.expanded_url.indexOf(domain) + domain.length + 1;
            const suffix: string = url.expanded_url.substring(startIndex);

            // Push the match details to the matches array
            result.matches.push({
              domain,
              suffix,
              fullUrl: url.expanded_url,
            });
            // Set isMatchFound to true if a match is found
            result.isMatchFound = true;
          }
        });

        return result;
      })
      // Filter to include only results with matches
      .filter((result: UrlCheckResult) => result.isMatchFound)
  );
}
