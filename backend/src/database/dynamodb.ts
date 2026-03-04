import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuid } from 'uuid'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)

export const createSportEvent = async (eventData: any) => {
  try {
    const item = {
      pk: `EVENT#${uuid()}`,
      sk: `TIMESTAMP#${Date.now()}`,
      ...eventData,
      createdAt: new Date().toISOString()
    }

    await docClient.send(
      new PutCommand({
        TableName: process.env.EVENTS_TABLE || 'SportsEvents',
        Item: item
      })
    )

    return item
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

export const getSportEvent = async (eventId: string) => {
  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: process.env.EVENTS_TABLE || 'SportsEvents',
        Key: { pk: eventId }
      })
    )

    return response.Item
  } catch (error) {
    console.error('Error getting event:', error)
    throw error
  }
}

export const getCountryEvents = async (countryCode: string) => {
  try {
    const response = await docClient.send(
      new QueryCommand({
        TableName: process.env.EVENTS_TABLE || 'SportsEvents',
        IndexName: 'CountryCodeIndex',
        KeyConditionExpression: 'countryCode = :cc',
        ExpressionAttributeValues: {
          ':cc': countryCode
        }
      })
    )

    return response.Items || []
  } catch (error) {
    console.error('Error querying events:', error)
    throw error
  }
}

export default {
  createSportEvent,
  getSportEvent,
  getCountryEvents
}
