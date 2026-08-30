/**
 * Monday.com GraphQL API Integration Layer
 * Supports live GraphQL API requests to https://api.monday.com/v2
 * as well as dynamic client querying and board sync functionality.
 */

import sampleData from '../data/sampleData.json';
import { cleanDeal, cleanWorkOrder } from './dataProcessor';

export class MondayApiService {
  constructor(apiKey = null, dealsBoardId = null, workOrdersBoardId = null) {
    this.apiKey = apiKey;
    this.dealsBoardId = dealsBoardId;
    this.workOrdersBoardId = workOrdersBoardId;
    this.endpoint = 'https://api.monday.com/v2';
  }

  setCredentials(apiKey, dealsBoardId, workOrdersBoardId) {
    this.apiKey = apiKey;
    this.dealsBoardId = dealsBoardId;
    this.workOrdersBoardId = workOrdersBoardId;
  }

  hasLiveCredentials() {
    return Boolean(this.apiKey && (this.dealsBoardId || this.workOrdersBoardId));
  }

  async executeGraphQL(query, variables = {}) {
    if (!this.apiKey) {
      throw new Error('Monday.com API key is not set.');
    }
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey,
        'API-Version': '2023-10'
      },
      body: JSON.stringify({ query, variables })
    });

    const data = await response.json();
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message || 'GraphQL Query Execution Error');
    }
    return data.data;
  }

  async testConnection() {
    if (!this.apiKey) return { success: false, message: 'No API key provided' };
    try {
      const data = await this.executeGraphQL(`query { me { id name email } }`);
      return { success: true, me: data.me, message: `Connected as ${data.me.name} (${data.me.email})` };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async fetchLiveBoard(boardId) {
    const query = `
      query GetBoardData($boardId: [ID!]) {
        boards(ids: $boardId) {
          id
          name
          columns {
            id
            title
            type
          }
          items_page(limit: 500) {
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `;
    const result = await this.executeGraphQL(query, { boardId: [boardId] });
    return result.boards[0] || null;
  }

  async getDatasets() {
    let rawDeals = sampleData.deals || [];
    let rawWorkOrders = sampleData.workOrders || [];
    let isLive = false;

    if (this.hasLiveCredentials()) {
      try {
        if (this.dealsBoardId) {
          const liveDealsBoard = await this.fetchLiveBoard(this.dealsBoardId);
          if (liveDealsBoard && liveDealsBoard.items_page) {
            rawDeals = this.transformMondayItemsToDeals(liveDealsBoard);
            isLive = true;
          }
        }
        if (this.workOrdersBoardId) {
          const liveWOBoard = await this.fetchLiveBoard(this.workOrdersBoardId);
          if (liveWOBoard && liveWOBoard.items_page) {
            rawWorkOrders = this.transformMondayItemsToWorkOrders(liveWOBoard);
            isLive = true;
          }
        }
      } catch (err) {
        console.warn('Fallback to local dataset due to API fetch error:', err.message);
      }
    }

    const cleanedDeals = rawDeals.map(cleanDeal);
    const cleanedWorkOrders = rawWorkOrders.map(cleanWorkOrder);

    return {
      deals: cleanedDeals,
      workOrders: cleanedWorkOrders,
      isLive,
      dealsCount: cleanedDeals.length,
      workOrdersCount: cleanedWorkOrders.length
    };
  }

  // Transform Monday.com column values into normalized Deal schema
  transformMondayItemsToDeals(board) {
    const colMap = {};
    board.columns.forEach(c => {
      colMap[c.title.toLowerCase().trim()] = c.id;
    });

    return board.items_page.items.map((item, idx) => {
      const getVal = (title) => {
        const id = colMap[title.toLowerCase().trim()];
        const cv = item.column_values.find(c => c.id === id);
        return cv ? cv.text : null;
      };

      return {
        id: item.id || `live-deal-${idx}`,
        dealName: item.name,
        ownerCode: getVal('Owner code') || 'Unassigned',
        clientCode: getVal('Client Code') || 'Unknown',
        dealStatus: getVal('Deal Status') || 'Open',
        closeDateActual: getVal('Close Date (A)'),
        closureProbability: parseFloat(getVal('Closure Probability')) || 0,
        maskedDealValue: parseFloat(getVal('Masked Deal value')) || 0,
        tentativeCloseDate: getVal('Tentative Close Date'),
        dealStage: getVal('Deal Stage') || 'Lead Generated',
        productDeal: getVal('Product deal') || 'Services',
        sector: getVal('Sector/service') || 'Others',
        createdDate: getVal('Created Date')
      };
    });
  }

  // Transform Monday.com column values into normalized Work Order schema
  transformMondayItemsToWorkOrders(board) {
    const colMap = {};
    board.columns.forEach(c => {
      colMap[c.title.toLowerCase().trim()] = c.id;
    });

    return board.items_page.items.map((item, idx) => {
      const getVal = (title) => {
        const id = colMap[title.toLowerCase().trim()];
        const cv = item.column_values.find(c => c.id === id);
        return cv ? cv.text : null;
      };

      return {
        id: item.id || `live-wo-${idx}`,
        dealName: item.name,
        customerCode: getVal('Customer Name Code') || 'Unknown',
        serialNo: getVal('Serial #') || `WO-${idx}`,
        natureOfWork: getVal('Nature of Work') || 'Services',
        executionStatus: getVal('Execution Status') || 'Not Started',
        sector: getVal('Sector') || 'Others',
        amountExclGst: parseFloat(getVal('Amount in Rupees (Excl of GST) (Masked)')) || 0,
        amountInclGst: parseFloat(getVal('Amount in Rupees (Incl of GST) (Masked)')) || 0,
        billedValueExclGst: parseFloat(getVal('Billed Value in Rupees (Excl of GST.) (Masked)')) || 0,
        collectedAmountInclGst: parseFloat(getVal('Collected Amount in Rupees (Incl of GST.) (Masked)')) || 0,
        amountToBeBilledExclGst: parseFloat(getVal('Amount to be billed in Rs. (Exl. of GST) (Masked)')) || 0,
        billingStatus: getVal('Billing Status') || 'Pending'
      };
    });
  }
}

export const mondayService = new MondayApiService();
