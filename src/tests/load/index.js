import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 100,
  duration: "10s",
};

const BASE_URL = "http://localhost:5000";

export default function () {
  loginUser();
  //regUser();
}

const loginUser = () => {
  const payload = JSON.stringify({
    shouldRememberMe: true,
    password: "testpassword",
    email: "test@example.com",
  });

  const headers = {
    'Content-Type': 'application/json'
  };

  const response = http.post(`${BASE_URL}/login`, payload, {
    headers: headers,
  });

  check(response, {
    "status is 200": (r) => r.status === 200,
  });
};

const regUser = async () => {
  const payload = JSON.stringify({
    shouldRememberMe: true,
    password: "testpassword",
    email: "user@example.com",
  });

  const response = http.post(`${BASE_URL}/registration`, payload);

  check(response, {
    "status is 200": (r) => r.status === 200,
    "user is created": (r) => {
      const responseBody = JSON.parse(r.body);
      return (
        responseBody.hasOwnProperty("userId") && responseBody.userId !== null
      );
    },
  });

  const user = await UserModel.findOne({ email: "user@example.com" });

  if (user) {
    await UserModel.deleteOne({ _id: user._id });
  }
};
