import {
  createContext,
  useContext,
  useState,
  ReactNode
} from 'react';

import { api, AuthUser } from '../api/client';


interface AuthContextValue {
  user: AuthUser | null;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
}


const AuthContext =
  createContext<AuthContextValue | undefined>(undefined);


function getSavedUser(): AuthUser | null {
  const raw =
    localStorage.getItem('keystone_user');

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem('keystone_user');
    localStorage.removeItem('keystone_token');

    return null;
  }
}


function normalizeRole(rawRole: any): string {
  let roleValue = rawRole;

  if (Array.isArray(roleValue)) {
    roleValue = roleValue[0];
  }

  if (
    roleValue &&
    typeof roleValue === 'object'
  ) {
    roleValue =
      roleValue.authority ??
      roleValue.name ??
      roleValue.role ??
      '';
  }

  return String(roleValue ?? '')
    .replace(/^ROLE_/i, '')
    .trim()
    .toUpperCase();
}


export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(getSavedUser);


  async function login(
    email: string,
    password: string
  ): Promise<void> {
    const res = await api.post(
      '/auth/login',
      {
        email,
        password
      }
    );

    console.log(
      'LOGIN RESPONSE:',
      res.data
    );


    const outer =
      res.data ?? {};

    const payload =
      outer.data ??
      outer;

    const responseUser =
      payload.user ??
      outer.user ??
      payload;


    const token =
      outer.token ??
      outer.accessToken ??
      payload.token ??
      payload.accessToken;


    const rawRole =
      responseUser.role ??
      responseUser.roles ??
      responseUser.authorities ??
      payload.role ??
      payload.roles ??
      payload.authorities;


    const role =
      normalizeRole(rawRole);


    if (!token) {
      console.error(
        'TOKEN NOT FOUND:',
        res.data
      );

      throw new Error(
        'Login response does not contain token'
      );
    }


    if (!role) {
      console.error(
        'ROLE NOT FOUND:',
        res.data
      );

      throw new Error(
        'Login response does not contain role'
      );
    }


    const authUser: AuthUser = {
      email:
        responseUser.email ??
        email,

      name:
        responseUser.name ??
        responseUser.fullName ??
        email.split('@')[0],

      role: role as AuthUser['role']
    };


    console.log(
      'SAVED USER:',
      authUser
    );


    localStorage.setItem(
      'keystone_token',
      String(token)
    );

    localStorage.setItem(
      'keystone_user',
      JSON.stringify(authUser)
    );


    setUser(authUser);
  }


  function logout(): void {
    localStorage.removeItem(
      'keystone_token'
    );

    localStorage.removeItem(
      'keystone_user'
    );

    setUser(null);
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth(): AuthContextValue {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
}