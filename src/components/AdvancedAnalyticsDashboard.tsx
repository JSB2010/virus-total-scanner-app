/**
 * Advanced Analytics Dashboard for DropSentinel
 * Provides comprehensive insights into security performance and system health
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Cpu,
  HardDrive,
  Network,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  performance: {
    avgScanTime: number;
    cacheHitRate: number;
    systemLoad: number;
    memoryUsage: number;
    cpuUsage: number;
    activeScans: number;
    queuedScans: number;
  };
  security: {
    totalScans: number;
    threatsDetected: number;
    cleanFiles: number;
    quarantinedFiles: number;
    riskDistribution: Array<{ name: string; value: number; color: string }>;
    threatTrends: Array<{ date: string; threats: number; scans: number }>;
  };
  cache: {
    totalEntries: number;
    hitRate: number;
    missRate: number;
    cacheSize: number;
    recommendations: string[];
  };
  system: {
    uptime: number;
    lastUpdate: string;
    version: string;
    platform: string;
    nodeVersion: string;
  };
}

interface AdvancedAnalyticsDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvancedAnalyticsDashboard({ open, onOpenChange }: AdvancedAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock data for demonstration
  useEffect(() => {
    if (open) {
      loadAnalyticsData();
    }
  }, [open]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: AnalyticsData = {
      performance: {
        avgScanTime: 12500,
        cacheHitRate: 78.5,
        systemLoad: 45.2,
        memoryUsage: 62.8,
        cpuUsage: 34.1,
        activeScans: 2,
        queuedScans: 5
      },
      security: {
        totalScans: 1247,
        threatsDetected: 23,
        cleanFiles: 1224,
        quarantinedFiles: 18,
        riskDistribution: [
          { name: 'Clean', value: 1224, color: '#10b981' },
          { name: 'Low Risk', value: 15, color: '#f59e0b' },
          { name: 'Medium Risk', value: 6, color: '#f97316' },
          { name: 'High Risk', value: 2, color: '#ef4444' }
        ],
        threatTrends: [
          { date: '2024-01-01', threats: 2, scans: 45 },
          { date: '2024-01-02', threats: 1, scans: 52 },
          { date: '2024-01-03', threats: 4, scans: 38 },
          { date: '2024-01-04', threats: 0, scans: 61 },
          { date: '2024-01-05', threats: 3, scans: 47 },
          { date: '2024-01-06', threats: 1, scans: 55 },
          { date: '2024-01-07', threats: 2, scans: 49 }
        ]
      },
      cache: {
        totalEntries: 892,
        hitRate: 78.5,
        missRate: 21.5,
        cacheSize: 45.2,
        recommendations: [
          'Cache hit rate is good but could be improved',
          'Consider increasing cache duration for clean files',
          'Monitor cache size growth'
        ]
      },
      system: {
        uptime: 86400000, // 24 hours in ms
        lastUpdate: new Date().toISOString(),
        version: '1.0.0',
        platform: 'darwin',
        nodeVersion: '18.17.0'
      }
    };
    
    setAnalyticsData(mockData);
    setIsLoading(false);
    setLastRefresh(new Date());
  };

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (value: number, type: 'cpu' | 'memory' | 'cache') => {
    if (type === 'cache') {
      return value > 80 ? 'text-green-600' : value > 60 ? 'text-yellow-600' : 'text-red-600';
    }
    return value < 50 ? 'text-green-600' : value < 80 ? 'text-yellow-600' : 'text-red-600';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Advanced Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAnalyticsData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
                <TabsTrigger value="overview">
                  <Eye className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="performance">
                  <Zap className="w-4 h-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Settings className="w-4 h-4 mr-2" />
                  System
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-full"
                    >
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-muted-foreground">Loading analytics data...</p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <TabsContent value="overview" className="mt-0">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
                        >
                          {/* Key Metrics Cards */}
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                                  <p className="text-2xl font-bold">{analyticsData?.security.totalScans.toLocaleString()}</p>
                                </div>
                                <Activity className="w-8 h-8 text-blue-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Threats Detected</p>
                                  <p className="text-2xl font-bold text-red-600">{analyticsData?.security.threatsDetected}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Cache Hit Rate</p>
                                  <p className={`text-2xl font-bold ${getPerformanceColor(analyticsData?.performance.cacheHitRate || 0, 'cache')}`}>
                                    {analyticsData?.performance.cacheHitRate.toFixed(1)}%
                                  </p>
                                </div>
                                <Database className="w-8 h-8 text-green-600" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Avg Scan Time</p>
                                  <p className="text-2xl font-bold">{((analyticsData?.performance.avgScanTime || 0) / 1000).toFixed(1)}s</p>
                                </div>
                                <Clock className="w-8 h-8 text-purple-600" />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Threat Trends</CardTitle>
                              <CardDescription>Daily threat detection over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analyticsData?.security.threatTrends}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} />
                                  <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Risk Distribution</CardTitle>
                              <CardDescription>Files categorized by risk level</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                  <Pie
                                    data={analyticsData?.security.riskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {analyticsData?.security.riskDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Additional tabs would be implemented here */}
                      <TabsContent value="performance" className="mt-0">
                        <div className="text-center py-12">
                          <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                          <p className="text-muted-foreground">Detailed performance metrics coming soon...</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="security" className="mt-0">
                        <div className="text-center py-12">
                          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Security Analytics</h3>
                          <p className="text-muted-foreground">Advanced security insights coming soon...</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="system" className="mt-0">
                        <div className="text-center py-12">
                          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">System Information</h3>
                          <p className="text-muted-foreground">System health and diagnostics coming soon...</p>
                        </div>
                      </TabsContent>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
