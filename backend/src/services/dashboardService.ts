import { CloudWatchClient, PutDashboardCommand } from '@aws-sdk/client-cloudwatch'

const cloudwatch = new CloudWatchClient({ region: process.env.AWS_REGION || 'us-east-1' })

export const createMonitoringDashboard = async (environment: string = 'dev') => {
  try {
    const dashboardBody = {
      widgets: [
        {
          type: 'metric',
          properties: {
            metrics: [
              ['AWS/Lambda', 'Invocations', { stat: 'Sum' }],
              ['.', 'Duration', { stat: 'Average' }],
              ['.', 'Errors', { stat: 'Sum' }],
              ['.', 'Throttles', { stat: 'Sum' }]
            ],
            period: 300,
            stat: 'Average',
            region: process.env.AWS_REGION || 'us-east-1',
            title: 'Lambda Function Metrics',
            yAxis: { left: { min: 0 } }
          }
        },
        {
          type: 'metric',
          properties: {
            metrics: [
              ['AWS/RDS', 'CPUUtilization'],
              ['.', 'DatabaseConnections'],
              ['.', 'FreeableMemory'],
              ['.', 'StorageSpace']
            ],
            period: 300,
            stat: 'Average',
            region: process.env.AWS_REGION || 'us-east-1',
            title: 'RDS PostgreSQL Metrics',
            yAxis: { left: { min: 0, max: 100 } }
          }
        },
        {
          type: 'metric',
          properties: {
            metrics: [
              ['AWS/DynamoDB', 'ConsumedReadCapacityUnits'],
              ['.', 'ConsumedWriteCapacityUnits'],
              ['.', 'UserErrors'],
              ['.', 'SystemErrors']
            ],
            period: 60,
            stat: 'Sum',
            region: process.env.AWS_REGION || 'us-east-1',
            title: 'DynamoDB Performance'
          }
        },
        {
          type: 'metric',
          properties: {
            metrics: [
              ['AWS/ApiGateway', 'Count'],
              ['.', 'Latency', { stat: 'Average' }],
              ['.', '4XXError', { stat: 'Sum' }],
              ['.', '5XXError', { stat: 'Sum' }]
            ],
            period: 300,
            stat: 'Average',
            region: process.env.AWS_REGION || 'us-east-1',
            title: 'API Gateway Metrics'
          }
        },
        {
          type: 'log',
          properties: {
            query: `fields @timestamp, @message, @duration
                    | stats avg(@duration) as avg_duration, max(@duration) as max_duration, pct(@duration, 95) as p95
                    | sort @timestamp desc`,
            region: process.env.AWS_REGION || 'us-east-1',
            title: 'API Response Time Analysis',
            queryId: 'sports-monitor-dashboard-1'
          }
        },
        {
          type: 'metric',
          properties: {
            metrics: [
              ['AWS/ElastiCache', 'CPUUtilization'],
              ['.', 'NetworkBytesIn'],
              ['.', 'NetworkBytesOut'],
              ['.', 'EngineCPUUtilization']
            ],
            period: 300,
            stat: 'Average',
            region: process.env.AWS_REGION || 'us-east-1',
            title: 'Redis Cache Performance'
          }
        }
      ]
    }

    const command = new PutDashboardCommand({
      DashboardName: `SportsMonitor-${environment}`,
      DashboardBody: JSON.stringify(dashboardBody)
    })

    await cloudwatch.send(command)
    console.log(`✅ CloudWatch dashboard created: SportsMonitor-${environment}`)
    return `SportsMonitor-${environment}`
  } catch (error) {
    console.error('Failed to create dashboard:', error)
    throw error
  }
}

export default { createMonitoringDashboard }
