import axios, { AxiosError } from "axios";
import Router from "next/router";

import { destroyCookie, parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";
let isRefreshing = false;
let faliedRequestQueue = [];
let cookies = parseCookies();

export const api = axios.create({
  baseURL: "http://localhost:3333/",
  headers: {
    Authorization: `Bearer ${cookies["@app.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === "token.expired") {
        cookies = parseCookies();
        const { "@app.refreshToken": refreshToken } = cookies;
        const originalConfig = error.config;
        if (!isRefreshing) {
          isRefreshing = true;
          api
            .post("refresh", { refreshToken })
            .then((response) => {
              const token = response.data.token;

              setCookie(undefined, "@app.token", token, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
              });
              setCookie(
                undefined,
                "@app.refreshToken",
                response.data.refreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30,
                  path: "/",
                }
              );
              api.defaults.headers["Authorization"] = `Bearer ${token}`;
              faliedRequestQueue.forEach((request) => {
                request.resolve(token);
              });
              faliedRequestQueue = [];
            })
            .catch((err) => {
              faliedRequestQueue.forEach((request) => {
                request.reject(err);
              });
              faliedRequestQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }
        return new Promise((resolver, reject) => {
          faliedRequestQueue.push({
            resolve: (token: string) => {
              originalConfig.headers["Authorization"] = `Bearer ${token}`;
              resolver(api(originalConfig));
            },
            reject: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      } else {
        signOut();
      }
    }
    return Promise.reject(error);
  }
);
