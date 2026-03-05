import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSportEvent, getSportEvent, getCountryEvents } from '../database/dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

vi.mock('@aws-sdk/client-dynamodb', () => {
  return { DynamoDBClient: vi.fn() };
});

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn()
}));

vi.mock('@aws-sdk/lib-dynamodb', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: vi.fn(() => ({ send: sendMock }))
    }
  };
});

describe('DynamoDB Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a sport event', async () => {
    sendMock.mockResolvedValueOnce({});
    
    const result = await createSportEvent({ sport: 'Football' });
    
    expect(result).toHaveProperty('pk');
    expect(result.sport).toBe('Football');
    expect(sendMock).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it('should get a sport event by ID', async () => {
    const mockItem = { pk: 'valid-id' };
    sendMock.mockResolvedValueOnce({ Item: mockItem });
    
    const result = await getSportEvent('valid-id');
    
    expect(result).toEqual(mockItem);
    expect(sendMock).toHaveBeenCalledWith(expect.any(GetCommand));
  });

  it('should get events by country', async () => {
    const mockItems = [{ countryCode: 'BR' }];
    sendMock.mockResolvedValueOnce({ Items: mockItems });
    
    const result = await getCountryEvents('BR');
    
    expect(result).toEqual(mockItems);
    expect(sendMock).toHaveBeenCalledWith(expect.any(QueryCommand));
  });

  it('should handle missing country events gracefully', async () => {
    sendMock.mockResolvedValueOnce({});
    
    const result = await getCountryEvents('UNKNOWN');
    
    expect(result).toEqual([]);
  });
  
  it('should throw on send error', async () => {
    sendMock.mockRejectedValueOnce(new Error('Dynamo Error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(getSportEvent('id')).rejects.toThrow('Dynamo Error');
  });
});
