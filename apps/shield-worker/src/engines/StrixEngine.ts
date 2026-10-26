import { logger } from "../utils/logger.js";

export interface StrixScanOptions {
  target: string;
  scanType: "dast" | "container" | "dependencies" | "sast";
  timeoutSeconds?: number;
}

export interface StrixVulnerabilityFinding {
  ruleId: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  title: string;
  description: string;
  location?: string;
}

export interface StrixScanResult {
  scanId: string;
  target: string;
  scanType: string;
  findings: StrixVulnerabilityFinding[];
  durationMs: number;
  completedAt: string;
}

export interface SarifReport {
  $schema: string;
  version: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
      };
    };
    results: Array<{
      ruleId: string;
      level: string;
      message: { text: string };
    }>;
  }>;
}

export class StrixEngine {
  private options: StrixScanOptions;

  constructor(options: StrixScanOptions) {
    this.options = options;
  }

  public async runScan(): Promise<StrixScanResult> {
    const startTime = Date.now();
    logger.info("StrixEngine: starting security analysis on target", {
      target: this.options.target,
      scanType: this.options.scanType,
    });

    const findings: StrixVulnerabilityFinding[] = [];

    try {
      if (this.options.scanType === "dast") {
        await this.performDASTScan(this.options.target, findings);
      } else if (this.options.scanType === "sast") {
        this.performSASTScan(this.options.target, findings);
      } else if (this.options.scanType === "dependencies") {
        this.performDependencyScan(this.options.target, findings);
      } else {
        this.performContainerScan(this.options.target, findings);
      }
    } catch (err) {
      logger.error("StrixEngine: error during security scan", { error: err, target: this.options.target });
      findings.push({
        ruleId: "STRIX-ERR-001",
        severity: "INFORMATIONAL",
        title: "Scan Target Unreachable",
        description: `Target could not be reached for active scan: ${err instanceof Error ? err.message : String(err)}`,
        location: this.options.target,
      });
    }

    const durationMs = Date.now() - startTime;
    logger.info("StrixEngine: scan completed", {
      target: this.options.target,
      findingsCount: findings.length,
      durationMs,
    });

    return {
      scanId: `strix-${Math.random().toString(36).substring(2, 9)}`,
      target: this.options.target,
      scanType: this.options.scanType,
      findings,
      durationMs,
      completedAt: new Date().toISOString(),
    };
  }

  private async performDASTScan(target: string, findings: StrixVulnerabilityFinding[]): Promise<void> {
    const url = target.startsWith("http") ? target : `https://${target}`;

    if (!url.startsWith("https://")) {
      findings.push({
        ruleId: "STRIX-SEC-001",
        severity: "HIGH",
        title: "Unencrypted HTTP Transport",
        description: "Target URL does not enforce HTTPS encryption in transit.",
        location: url,
      });
    }

    const response = await fetch(url, { method: "GET", redirect: "manual" });
    const headers = response.headers;

    if (!headers.get("strict-transport-security")) {
      findings.push({
        ruleId: "STRIX-SEC-002",
        severity: "MEDIUM",
        title: "Missing Strict-Transport-Security (HSTS) Header",
        description: "HSTS header is absent, exposing connections to SSL stripping attacks.",
        location: url,
      });
    }

    if (!headers.get("content-security-policy")) {
      findings.push({
        ruleId: "STRIX-SEC-003",
        severity: "MEDIUM",
        title: "Missing Content-Security-Policy Header",
        description: "Content-Security-Policy (CSP) is not configured, increasing XSS vulnerability risks.",
        location: url,
      });
    }

    if (!headers.get("x-frame-options")) {
      findings.push({
        ruleId: "STRIX-SEC-004",
        severity: "LOW",
        title: "Missing X-Frame-Options Header",
        description: "X-Frame-Options header missing; target may be vulnerable to clickjacking framing.",
        location: url,
      });
    }

    if (!headers.get("x-content-type-options")) {
      findings.push({
        ruleId: "STRIX-SEC-005",
        severity: "LOW",
        title: "Missing X-Content-Type-Options Header",
        description: "X-Content-Type-Options header missing; MIME-type sniffing is enabled.",
        location: url,
      });
    }
  }

  private performSASTScan(codeSnippet: string, findings: StrixVulnerabilityFinding[]): void {
    if (codeSnippet.includes("eval(") || codeSnippet.includes("Function(")) {
      findings.push({
        ruleId: "STRIX-SAST-001",
        severity: "CRITICAL",
        title: "Dynamic Code Execution (eval)",
        description: "Use of eval() or Function constructor detected, enabling arbitrary code execution.",
        location: "Source Code Analysis",
      });
    }

    if (codeSnippet.match(/AWS_SECRET|API_KEY_PRIVATE|PRIVATE_KEY|password\s*=\s*['"][^'"]+['"]/i)) {
      findings.push({
        ruleId: "STRIX-SAST-002",
        severity: "HIGH",
        title: "Hardcoded Secret / Credentials",
        description: "Potential hardcoded API key, private key or password detected in source text.",
        location: "Source Code Analysis",
      });
    }

    if (codeSnippet.includes("innerHTML")) {
      findings.push({
        ruleId: "STRIX-SAST-003",
        severity: "MEDIUM",
        title: "Unsafe DOM Assignment (innerHTML)",
        description: "Direct innerHTML assignment detected; sanitize input to prevent DOM XSS.",
        location: "Source Code Analysis",
      });
    }
  }

  private performDependencyScan(targetManifest: string, findings: StrixVulnerabilityFinding[]): void {
    if (targetManifest.includes('"lodash": "4.17.15"') || targetManifest.includes('"lodash": "^4.17.11"')) {
      findings.push({
        ruleId: "STRIX-DEP-001",
        severity: "HIGH",
        title: "Vulnerable Lodash Dependency (CVE-2020-8203)",
        description: "Prototype pollution vulnerability present in lodash versions < 4.17.19.",
        location: "package.json",
      });
    }

    if (targetManifest.includes('"express": "4.16.')) {
      findings.push({
        ruleId: "STRIX-DEP-002",
        severity: "MEDIUM",
        title: "Outdated Express Framework Dependency",
        description: "Express framework version contains known security patches in newer releases.",
        location: "package.json",
      });
    }
  }

  private performContainerScan(targetConfig: string, findings: StrixVulnerabilityFinding[]): void {
    if (targetConfig.includes("USER root") || !targetConfig.includes("USER ")) {
      findings.push({
        ruleId: "STRIX-CTR-001",
        severity: "HIGH",
        title: "Container Running as Root User",
        description: "Container process runs as root; non-privileged user specification recommended.",
        location: "Dockerfile",
      });
    }

    if (targetConfig.includes(":latest")) {
      findings.push({
        ruleId: "STRIX-CTR-002",
        severity: "LOW",
        title: "Mutable Base Image Tag (:latest)",
        description: "Using mutable :latest image tags can cause non-deterministic container builds.",
        location: "Dockerfile",
      });
    }
  }

  public async generateSarifReport(scanResult: StrixScanResult): Promise<SarifReport> {
    logger.info("StrixEngine: formatting scan findings into SARIF 2.1.0 standard", {
      scanId: scanResult.scanId,
      findingCount: scanResult.findings.length,
    });

    return {
      $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "Strix Security Engine",
              version: "1.0.0",
              informationUri: "https://stive.tech/shield",
            },
          },
          results: scanResult.findings.map((finding) => ({
            ruleId: finding.ruleId,
            level: finding.severity === "CRITICAL" || finding.severity === "HIGH" ? "error" : "warning",
            message: { text: `${finding.title}: ${finding.description}` },
          })),
        },
      ],
    };
  }
}
