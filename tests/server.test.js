// tests/server.test.js
const request = require('supertest');
const express = require('express');
const mysql = require('mysql');
const app = require('../server'); // We'll modify server.js to export the app

// Mock MySQL
jest.mock('mysql', () => {
  const mockConnection = {
    connect: jest.fn(callback => callback()),
    query: jest.fn((query, params, callback) => {
      // Handle different callback formats
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      
      // Mock successful responses based on query
      if (query.includes('SELECT * FROM donors')) {
        callback(null, [
          { id: 1, name: 'John Doe', blood_type: 'A+', gender: 'Male', age: 30, contact: '1234567890', city: 'New York' }
        ]);
      } else if (query.includes('SELECT * FROM blood_requests')) {
        callback(null, [
          { id: 1, blood_type: 'O-', units: 2, hospital_name: 'City Hospital', status: 'pending' }
        ]);
      } else if (query.includes('INSERT INTO')) {
        callback(null, { insertId: 1, affectedRows: 1 });
      } else if (query.includes('UPDATE')) {
        callback(null, { affectedRows: 1 });
      } else {
        callback(null, []);
      }
    })
  };
  
  return {
    createConnection: jest.fn(() => mockConnection)
  };
});

// Mock express-mysql-session
jest.mock('express-mysql-session', () => {
  return jest.fn().mockImplementation(() => {
    return function() {
      return {
        on: jest.fn()
      };
    };
  });
});

describe('Blood Bank API Tests', () => {
  // Test blood request endpoint
  test('POST /request-blood - should submit a blood request', async () => {
    const res = await request(app)
      .post('/request-blood')
      .send({
        blood_type: 'O+',
        units: 3,
        hospital_name: 'General Hospital'
      });
    
    expect(res.status).toBe(200);
    expect(res.text).toBe('Blood request submitted successfully!');
  });
});