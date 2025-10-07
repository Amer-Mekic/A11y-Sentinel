/**
 * Processes the results from an axe accessibility scan and summarizes key information.
 *
 * @param {Object} axeResults - The raw results object returned by axe-core after scanning a page.
 * @param {Array} axeResults.violations - Array of violation objects detected by axe.
 * @param {Array} [axeResults.incomplete] - Array of incomplete results, treated as warnings.
 * @param {string} pageUrl - The URL of the page that was scanned.
 * @returns {Object} An object containing:
 *   - summary: {Object} High-level summary including error count, warning count, accessibility score, and timestamp.
 *   - violations: {Array} List of processed violation objects with essential details and affected elements.
 *   - pageUrl: {string} The URL of the scanned page.
 *
 * @example
 * const results = processAxeResults(axeResults, 'https://example.com');
 * console.log(results.summary.errorCount); // Number of accessibility errors
 */
function processAxeResults(axeResults, pageUrl) {
  // High-level summary (for ScanResult model)
  const summary = {
    errorCount: axeResults.violations.length,
    warningCount: axeResults.incomplete?.length || 0, // Treat incomplete as warnings
    score: calculateAccessibilityScore(axeResults),
    timestamp: new Date()
  };

  // Processed violations
  const processedViolations = axeResults.violations.map(violation => {
    // Extract only the essential information
    return {
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      // Process nodes to extract the most critical information
      elements: violation.nodes.map(node => ({
        html: node.html,
        target: node.target[0], // Just take the first CSS selector
        failureSummary: node.failureSummary,
        // Extract specific data based on rule type
        ...extractRuleSpecificData(violation.id, node)
      }))
    };
  });

  return {
    summary,
    violations: processedViolations,
    pageUrl
  };
}

// Helper function to extract rule-specific useful data
function extractRuleSpecificData(ruleId, node) {
  const data = {};
  
  switch (ruleId) {
    case 'color-contrast':
      if (node.any && node.any[0] && node.any[0].data) {
        const contrastData = node.any[0].data;
        data.contrast = {
          ratio: contrastData.contrastRatio,
          expected: contrastData.expectedContrastRatio,
          foreground: contrastData.fgColor,
          background: contrastData.bgColor,
          fontSize: contrastData.fontSize
        };
      }
      break;
      
    case 'image-alt':
      data.missingAlt = true;
      break;
      
    case 'link-name':
      data.missingLinkText = true;
      break;
      
    // Will add more rule-specific data extraction cases ... 
  }
  
  return data;
}

// Calculate an accessibility score (0-100)
function calculateAccessibilityScore(axeResults) {
  const totalViolations = axeResults.violations.length;
  
  // Simple tiered scoring 
  if (totalViolations === 0) return 100;
  if (totalViolations <= 3) return 80;
  if (totalViolations <= 10) return 60;
  if (totalViolations <= 20) return 40;
  if (totalViolations <= 35) return 20;
  return 0;
}