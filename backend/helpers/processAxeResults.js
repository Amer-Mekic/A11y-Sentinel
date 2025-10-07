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