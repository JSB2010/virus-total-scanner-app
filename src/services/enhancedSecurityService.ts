/**
 * Enhanced Security Service for DropSentinel
 * Provides multi-layered security analysis with behavioral detection and heuristics
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { intelligentCacheService } from './intelligentCacheService';
import { performanceMonitorService } from './performanceMonitorService';

export interface SecurityAnalysisResult {
  fileName: string;
  filePath: string;
  fileHash: string;
  fileSize: number;
  analysisId: string;
  timestamp: string;

  // Multi-engine results
  virusTotalResult?: any;
  heuristicResult: HeuristicAnalysis;
  behavioralResult: BehavioralAnalysis;
  reputationResult: ReputationAnalysis;

  // Overall assessment
  overallThreatLevel: 'clean' | 'suspicious' | 'malicious' | 'critical';
  confidenceScore: number; // 0-100
  riskScore: number; // 0-100
  recommendations: string[];

  // Performance metrics
  analysisTime: number;
  cacheHit: boolean;
}

export interface HeuristicAnalysis {
  suspiciousPatterns: string[];
  entropyScore: number; // File randomness
  packerDetected: boolean;
  obfuscationDetected: boolean;
  suspiciousStrings: string[];
  fileTypeConsistency: boolean;
  digitalSignature: {
    present: boolean;
    valid: boolean;
    issuer?: string;
    trusted: boolean;
  };
}

export interface BehavioralAnalysis {
  networkConnections: string[];
  fileSystemChanges: string[];
  registryChanges: string[];
  processCreation: string[];
  suspiciousAPICalls: string[];
  sandboxBehavior: 'safe' | 'suspicious' | 'malicious';
}

export interface ReputationAnalysis {
  globalReputation: 'good' | 'neutral' | 'bad' | 'unknown';
  firstSeenDate?: string;
  prevalence: number; // How common this file is
  sourceReputation: 'trusted' | 'neutral' | 'untrusted';
  communityVotes: {
    malicious: number;
    clean: number;
  };
}

export class EnhancedSecurityService {
  private static instance: EnhancedSecurityService;

  // Known malicious patterns (simplified for demo)
  private readonly SUSPICIOUS_STRINGS = [
    'eval(', 'exec(', 'system(', 'shell_exec',
    'CreateProcess', 'WinExec', 'ShellExecute',
    'RegSetValue', 'RegCreateKey', 'RegDeleteKey',
    'VirtualAlloc', 'WriteProcessMemory',
    'SetWindowsHook', 'keylogger', 'backdoor'
  ];

  private readonly SUSPICIOUS_EXTENSIONS = [
    '.scr', '.pif', '.com', '.bat', '.cmd', '.vbs', '.js'
  ];

  private readonly TRUSTED_SIGNERS = [
    'Microsoft Corporation',
    'Apple Inc.',
    'Google LLC',
    'Adobe Systems'
  ];

  private constructor() {}

  public static getInstance(): EnhancedSecurityService {
    if (!EnhancedSecurityService.instance) {
      EnhancedSecurityService.instance = new EnhancedSecurityService();
    }
    return EnhancedSecurityService.instance;
  }

  /**
   * Perform comprehensive security analysis
   */
  public async analyzeFile(filePath: string): Promise<SecurityAnalysisResult> {
    const startTime = Date.now();
    const fileName = path.basename(filePath);
    const fileStats = fs.statSync(filePath);
    const analysisId = crypto.randomUUID();

    console.log(`[SECURITY] 🔍 Starting enhanced analysis for: ${fileName}`);

    // Start performance tracking
    performanceMonitorService.startScanTracking(analysisId, fileName, fileStats.size);

    try {
      // Check cache first
      const cachedResult = await intelligentCacheService.getCachedResult(filePath);
      if (cachedResult && cachedResult.confidence > 80) {
        console.log(`[SECURITY] ⚡ Using cached result (confidence: ${cachedResult.confidence}%)`);

        performanceMonitorService.endScanTracking(analysisId, 1);

        return {
          fileName,
          filePath,
          fileHash: cachedResult.fileHash,
          fileSize: fileStats.size,
          analysisId,
          timestamp: new Date().toISOString(),
          virusTotalResult: cachedResult.scanResult,
          heuristicResult: await this.performHeuristicAnalysis(filePath),
          behavioralResult: await this.performBehavioralAnalysis(filePath),
          reputationResult: await this.performReputationAnalysis(filePath),
          overallThreatLevel: cachedResult.scanResult.status === 'clean' ? 'clean' :
                             cachedResult.scanResult.threats > 5 ? 'critical' :
                             cachedResult.scanResult.threats > 0 ? 'malicious' : 'clean',
          confidenceScore: cachedResult.confidence,
          riskScore: this.calculateRiskScore(cachedResult.scanResult, null, null, null),
          recommendations: [],
          analysisTime: Date.now() - startTime,
          cacheHit: true
        };
      }

      // Perform multi-layered analysis
      const [heuristicResult, behavioralResult, reputationResult] = await Promise.all([
        this.performHeuristicAnalysis(filePath),
        this.performBehavioralAnalysis(filePath),
        this.performReputationAnalysis(filePath)
      ]);

      // Calculate file hash
      const fileHash = await intelligentCacheService.calculateFileHash(filePath);

      // Determine overall threat level
      const overallThreatLevel = this.determineOverallThreatLevel(
        null, // VirusTotal result would go here
        heuristicResult,
        behavioralResult,
        reputationResult
      );

      // Calculate confidence and risk scores
      const confidenceScore = this.calculateConfidenceScore(heuristicResult, behavioralResult, reputationResult);
      const riskScore = this.calculateRiskScore(null, heuristicResult, behavioralResult, reputationResult);

      // Generate recommendations
      const recommendations = this.generateRecommendations(overallThreatLevel, heuristicResult, behavioralResult);

      const result: SecurityAnalysisResult = {
        fileName,
        filePath,
        fileHash,
        fileSize: fileStats.size,
        analysisId,
        timestamp: new Date().toISOString(),
        heuristicResult,
        behavioralResult,
        reputationResult,
        overallThreatLevel,
        confidenceScore,
        riskScore,
        recommendations,
        analysisTime: Date.now() - startTime,
        cacheHit: false
      };

      // Cache the result for future use
      await intelligentCacheService.cacheResult(filePath, fileName, fileStats.size, {
        status: overallThreatLevel === 'clean' ? 'clean' : 'threat',
        threats: riskScore > 70 ? 5 : riskScore > 40 ? 2 : 0,
        totalEngines: 1,
        positives: riskScore > 50 ? 1 : 0,
        scanId: analysisId
      });

      performanceMonitorService.endScanTracking(analysisId, 3); // 3 analysis engines

      console.log(`[SECURITY] ✅ Analysis complete: ${overallThreatLevel} (confidence: ${confidenceScore}%, risk: ${riskScore}%)`);

      return result;

    } catch (error) {
      console.error(`[SECURITY] ❌ Analysis failed for ${fileName}:`, error);
      performanceMonitorService.endScanTracking(analysisId, 0);

      throw new Error(`Security analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform heuristic analysis
   */
  private async performHeuristicAnalysis(filePath: string): Promise<HeuristicAnalysis> {
    try {
      const fileContent = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const fileExt = path.extname(fileName).toLowerCase();

      // Check for suspicious patterns
      const suspiciousPatterns: string[] = [];
      const fileContentStr = fileContent.toString('utf8', 0, Math.min(fileContent.length, 10000)); // First 10KB

      for (const pattern of this.SUSPICIOUS_STRINGS) {
        if (fileContentStr.includes(pattern)) {
          suspiciousPatterns.push(pattern);
        }
      }

      // Calculate entropy (randomness)
      const entropyScore = this.calculateEntropy(fileContent);

      // Check for packing/obfuscation
      const packerDetected = entropyScore > 7.5; // High entropy suggests packing
      const obfuscationDetected = suspiciousPatterns.length > 3;

      // Check file type consistency
      const fileTypeConsistency = this.checkFileTypeConsistency(fileName, fileContent);

      // Check digital signature (simplified)
      const digitalSignature = {
        present: false,
        valid: false,
        trusted: false
      };

      return {
        suspiciousPatterns,
        entropyScore,
        packerDetected,
        obfuscationDetected,
        suspiciousStrings: suspiciousPatterns,
        fileTypeConsistency,
        digitalSignature
      };

    } catch (error) {
      console.error('[SECURITY] ❌ Heuristic analysis failed:', error);
      return {
        suspiciousPatterns: [],
        entropyScore: 0,
        packerDetected: false,
        obfuscationDetected: false,
        suspiciousStrings: [],
        fileTypeConsistency: true,
        digitalSignature: { present: false, valid: false, trusted: false }
      };
    }
  }

  /**
   * Perform behavioral analysis (simulated)
   */
  private async performBehavioralAnalysis(filePath: string): Promise<BehavioralAnalysis> {
    // In a real implementation, this would involve:
    // - Running the file in a sandbox
    // - Monitoring system calls
    // - Tracking network connections
    // - Observing file system changes

    return {
      networkConnections: [],
      fileSystemChanges: [],
      registryChanges: [],
      processCreation: [],
      suspiciousAPICalls: [],
      sandboxBehavior: 'safe'
    };
  }

  /**
   * Perform reputation analysis
   */
  private async performReputationAnalysis(filePath: string): Promise<ReputationAnalysis> {
    // In a real implementation, this would query:
    // - Threat intelligence feeds
    // - File reputation databases
    // - Community voting systems

    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName).toLowerCase();

    // Simple heuristic based on file extension
    let globalReputation: 'good' | 'neutral' | 'bad' | 'unknown' = 'neutral';

    if (this.SUSPICIOUS_EXTENSIONS.includes(fileExt)) {
      globalReputation = 'bad';
    }

    return {
      globalReputation,
      prevalence: 50, // Placeholder
      sourceReputation: 'neutral',
      communityVotes: {
        malicious: 0,
        clean: 0
      }
    };
  }

  /**
   * Calculate file entropy
   */
  private calculateEntropy(data: Buffer): number {
    const frequency = new Array(256).fill(0);

    for (let i = 0; i < data.length; i++) {
      frequency[data[i]]++;
    }

    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (frequency[i] > 0) {
        const p = frequency[i] / data.length;
        entropy -= p * Math.log2(p);
      }
    }

    return entropy;
  }

  /**
   * Check file type consistency
   */
  private checkFileTypeConsistency(fileName: string, content: Buffer): boolean {
    const extension = path.extname(fileName).toLowerCase();

    // Check magic bytes for common file types
    const magicBytes = content.slice(0, 4);

    switch (extension) {
      case '.pdf':
        return magicBytes.toString('ascii', 0, 4) === '%PDF';
      case '.zip':
        return magicBytes[0] === 0x50 && magicBytes[1] === 0x4B;
      case '.exe':
        return magicBytes[0] === 0x4D && magicBytes[1] === 0x5A; // MZ header
      default:
        return true; // Assume consistent for unknown types
    }
  }

  /**
   * Determine overall threat level
   */
  private determineOverallThreatLevel(
    vtResult: any,
    heuristic: HeuristicAnalysis,
    behavioral: BehavioralAnalysis,
    reputation: ReputationAnalysis
  ): 'clean' | 'suspicious' | 'malicious' | 'critical' {

    let threatScore = 0;

    // Heuristic scoring
    threatScore += heuristic.suspiciousPatterns.length * 10;
    if (heuristic.packerDetected) threatScore += 20;
    if (heuristic.obfuscationDetected) threatScore += 30;
    if (!heuristic.fileTypeConsistency) threatScore += 25;

    // Behavioral scoring
    if (behavioral.sandboxBehavior === 'malicious') threatScore += 50;
    if (behavioral.sandboxBehavior === 'suspicious') threatScore += 25;

    // Reputation scoring
    if (reputation.globalReputation === 'bad') threatScore += 40;
    if (reputation.sourceReputation === 'untrusted') threatScore += 20;

    // Determine threat level
    if (threatScore >= 80) return 'critical';
    if (threatScore >= 50) return 'malicious';
    if (threatScore >= 20) return 'suspicious';
    return 'clean';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidenceScore(
    heuristic: HeuristicAnalysis,
    behavioral: BehavioralAnalysis,
    reputation: ReputationAnalysis
  ): number {
    let confidence = 70; // Base confidence

    // Increase confidence based on analysis depth
    if (heuristic.digitalSignature.present) confidence += 10;
    if (behavioral.sandboxBehavior !== 'safe') confidence += 15;
    if (reputation.globalReputation !== 'unknown') confidence += 10;

    return Math.min(100, confidence);
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(
    vtResult: any,
    heuristic: HeuristicAnalysis | null,
    behavioral: BehavioralAnalysis | null,
    reputation: ReputationAnalysis | null
  ): number {
    let riskScore = 0;

    if (vtResult?.threats > 0) {
      riskScore += Math.min(50, vtResult.threats * 10);
    }

    if (heuristic) {
      riskScore += heuristic.suspiciousPatterns.length * 5;
      if (heuristic.packerDetected) riskScore += 15;
      if (heuristic.obfuscationDetected) riskScore += 20;
    }

    if (behavioral?.sandboxBehavior === 'malicious') riskScore += 30;
    if (reputation?.globalReputation === 'bad') riskScore += 25;

    return Math.min(100, riskScore);
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(
    threatLevel: string,
    heuristic: HeuristicAnalysis,
    behavioral: BehavioralAnalysis
  ): string[] {
    const recommendations: string[] = [];

    if (threatLevel === 'critical' || threatLevel === 'malicious') {
      recommendations.push('🚨 Quarantine this file immediately');
      recommendations.push('🔍 Perform additional analysis with multiple engines');
      recommendations.push('🛡️ Scan system for additional threats');
    }

    if (heuristic.packerDetected) {
      recommendations.push('📦 File appears to be packed - exercise caution');
    }

    if (heuristic.suspiciousPatterns.length > 0) {
      recommendations.push('⚠️ Suspicious code patterns detected');
    }

    if (!heuristic.digitalSignature.present) {
      recommendations.push('✍️ File is not digitally signed - verify source');
    }

    return recommendations;
  }
}

// Export singleton instance
export const enhancedSecurityService = EnhancedSecurityService.getInstance();
