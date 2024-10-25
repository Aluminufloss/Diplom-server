import http from 'k6/http';
import { check } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

const BASE_URL = 'http://localhost:5000';

export const options = {
    vus: 1000,
    duration: '60s',
};

export default function () {
  try {
    const email = `user${randomString(5)}@example.com`;
    const password = 'testpassword';
    const username = `user${randomString(5)}`;
    
    const res = http.post(`${BASE_URL}/registration`, JSON.stringify({
        email: email,
        password: password,
        username: username
    }), { headers: { 'Content-Type': 'application/json' } });

    check(res, { 'registered successfully': (r) => r.status === 200 });
  } catch (err) {
    console.log("err", err)
    throw err;
  }
}
